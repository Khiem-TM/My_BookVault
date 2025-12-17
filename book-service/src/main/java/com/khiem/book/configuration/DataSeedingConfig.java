package com.khiem.book.configuration;

import com.khiem.book.service.GoogleBookImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@RequiredArgsConstructor
public class DataSeedingConfig {

    private final GoogleBookImportService googleBookImportService;

    @Bean
    @Profile("!test") // Don't run during tests
    public CommandLineRunner seedBooks() {
        return args -> {
            googleBookImportService.importBooks();
        };
    }
}
