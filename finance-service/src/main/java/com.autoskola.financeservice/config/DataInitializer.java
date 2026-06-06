package com.autoskola.financeservice.config;

import org.springframework.context.annotation.Configuration;

/**
 * Finance podaci se ne inicijalizuju automatski.
 * Finansijski racuni kreiraju se on-demand (POST /accounts/ensure/{candidateId})
 * kada admin prvi put otvori stranicu finansija za kandidata.
 */
@Configuration
public class DataInitializer {
    // Namjerno prazno — podaci se cuvaju trajno u bazi.
}
