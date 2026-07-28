package com.g9_latam_team_67.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        configureOracleWallet();
        SpringApplication.run(BackendApplication.class, args);
    }

    private static void configureOracleWallet() {
        String configuredTnsAdmin = System.getenv("TNS_ADMIN");
        if (configuredTnsAdmin != null && !configuredTnsAdmin.isBlank()) {
            System.setProperty("oracle.net.tns_admin", configuredTnsAdmin);
            return;
        }

        Path workingDirectory = Path.of(System.getProperty("user.dir"));
        Path walletPath = workingDirectory.resolve("src/main/resources/wallet");

        if (!Files.isDirectory(walletPath)) {
            walletPath = workingDirectory.resolve("backend/src/main/resources/wallet");
        }

        System.setProperty(
                "oracle.net.tns_admin",
                walletPath.toAbsolutePath().normalize().toString()
        );
    }

}
