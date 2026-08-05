package com.g9_latam_team_67.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {


    public static void main(String[] args) {
        System.setProperty("oracle.net.tns_admin",
            System.getProperty("user.dir") + "/src/main/resources/wallet");
        SpringApplication.run(BackendApplication.class, args);
    }

}
