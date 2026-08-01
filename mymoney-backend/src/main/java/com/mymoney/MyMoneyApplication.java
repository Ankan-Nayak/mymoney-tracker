package com.mymoney;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@SpringBootApplication
public class MyMoneyApplication {
    public static void main(String[] args) {
        ensureDatabaseExists();
        SpringApplication.run(MyMoneyApplication.class, args);
    }

    private static void ensureDatabaseExists() {
        String url = "jdbc:postgresql://localhost:5432/postgres";
        String user = "postgres";
        String password = "141202";
        String dbName = "ExpenseTracker";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            String checkSql = "SELECT 1 FROM pg_database WHERE datname = '" + dbName + "'";
            try (ResultSet rs = stmt.executeQuery(checkSql)) {
                if (!rs.next()) {
                    String createSql = "CREATE DATABASE \"" + dbName + "\"";
                    stmt.executeUpdate(createSql);
                    System.out.println("Database '" + dbName + "' created successfully.");
                } else {
                    System.out.println("Database '" + dbName + "' already exists.");
                }
            }
        } catch (Exception e) {
            System.err.println("Could not ensure database existence: " + e.getMessage());
        }
    }
}
