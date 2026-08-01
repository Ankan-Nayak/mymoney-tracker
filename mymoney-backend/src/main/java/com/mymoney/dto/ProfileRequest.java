package com.mymoney.dto;

public class ProfileRequest {
    private String phone;
    private String currency;
    private Boolean darkTheme;

    public ProfileRequest() {}

    public ProfileRequest(String phone, String currency, Boolean darkTheme) {
        this.phone = phone;
        this.currency = currency;
        this.darkTheme = darkTheme;
    }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Boolean getDarkTheme() { return darkTheme; }
    public void setDarkTheme(Boolean darkTheme) { this.darkTheme = darkTheme; }
}
