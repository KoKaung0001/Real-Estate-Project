package com.urbannest.backend.config;

import com.urbannest.backend.entity.ApprovalStatus;
import com.urbannest.backend.entity.Property;
import com.urbannest.backend.entity.PropertyType;
import com.urbannest.backend.entity.SaleStatus;
import com.urbannest.backend.entity.User;
import com.urbannest.backend.entity.UserRole;
import com.urbannest.backend.repository.PropertyRepository;
import com.urbannest.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
@Profile("local & seed")
@RequiredArgsConstructor
public class SamplePropertyDataImporter implements CommandLineRunner {

    private static final String SAMPLE_USERNAME = "_sample_data";
    private static final BigDecimal LAKH_TO_MMK = BigDecimal.valueOf(100_000);

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.sample-properties.path}")
    private String workbookPath;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        Path source = Path.of(workbookPath).toAbsolutePath().normalize();
        if (!Files.isRegularFile(source)) {
            throw new IllegalStateException("Sample property workbook not found: " + source);
        }

        User owner = userRepository.findByUsername(SAMPLE_USERNAME)
                .orElseGet(this::createSampleOwner);
        if (!propertyRepository.findByOwner(owner).isEmpty()) {
            return;
        }

        List<Property> properties = readProperties(source, owner);
        if (properties.isEmpty()) {
            throw new IllegalStateException("Sample property workbook has no importable rows: " + source);
        }
        propertyRepository.saveAll(properties);
    }

    private User createSampleOwner() {
        return userRepository.save(User.builder()
                .username(SAMPLE_USERNAME)
                .email("sample-data@local.urbannest")
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .phone("0000000000")
                .role(UserRole.USER)
                .build());
    }

    private List<Property> readProperties(Path source, User owner) throws Exception {
        List<Property> properties = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();

        try (Workbook workbook = WorkbookFactory.create(source.toFile())) {
            Sheet sheet = workbook.getSheet("Cleaned House Data");
            if (sheet == null) {
                throw new IllegalStateException("Worksheet 'Cleaned House Data' was not found");
            }

            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                Property property = row == null ? null : mapRow(row, formatter, owner);
                if (property != null) {
                    properties.add(property);
                }
            }
        }
        return properties;
    }

    private Property mapRow(Row row, DataFormatter formatter, User owner) {
        String title = cell(formatter, row, 0);
        String location = cell(formatter, row, 1);
        Double priceLakhs = numericCell(row, 2);
        Double area = numericCell(row, 3);
        String listingUrl = cell(formatter, row, 7);
        String imageUrl = cell(formatter, row, 8);

        boolean invalid = title.isBlank()
                || title.length() > 255
                || location.isBlank()
                || location.contains("စတုရန်းပေ")
                || location.toLowerCase().contains("sqft")
                || priceLakhs == null
                || priceLakhs < 100
                || priceLakhs > 99_999
                || area == null
                || area <= 0
                || !listingUrl.contains("/sale/");
        if (invalid) {
            return null;
        }

        return Property.builder()
                .title(title)
                .description("Imported local sample listing. Source: " + listingUrl)
                .price(BigDecimal.valueOf(priceLakhs).multiply(LAKH_TO_MMK))
                .location(location)
                .propertyType(PropertyType.APARTMENT)
                .status(SaleStatus.FOR_SALE)
                .approvalStatus(ApprovalStatus.APPROVED)
                .bedrooms(0)
                .bathrooms(0)
                .area(area)
                .imageUrl(imageUrl.startsWith("https://") || imageUrl.startsWith("http://") ? imageUrl : null)
                .owner(owner)
                .build();
    }

    private String cell(DataFormatter formatter, Row row, int column) {
        return formatter.formatCellValue(row.getCell(column)).trim();
    }

    private Double numericCell(Row row, int column) {
        if (row.getCell(column) == null) {
            return null;
        }
        return switch (row.getCell(column).getCellType()) {
            case NUMERIC -> row.getCell(column).getNumericCellValue();
            default -> null;
        };
    }
}
