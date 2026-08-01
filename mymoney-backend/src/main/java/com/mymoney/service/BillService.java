package com.mymoney.service;

import com.mymoney.exception.ResourceNotFoundException;
import com.mymoney.model.Bill;
import com.mymoney.model.User;
import com.mymoney.repository.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class BillService {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private UserService userService;

    @Value("${mymoney.upload.dir}")
    private String uploadDir;

    public List<Bill> getAllBills(String username) {
        User user = userService.findByUsername(username);
        return billRepository.findAllByUserOrderByDueDateAsc(user);
    }

    public List<Bill> getBillsByPaidStatus(String username, boolean paid) {
        User user = userService.findByUsername(username);
        return billRepository.findAllByUserAndPaidOrderByDueDateAsc(user, paid);
    }

    public Bill createBill(String username, Bill bill, MultipartFile file) throws IOException {
        User user = userService.findByUsername(username);
        bill.setUser(user);

        if (file != null && !file.isEmpty()) {
            String path = saveBillProof(file);
            bill.setBillImage(path);
        }

        return billRepository.save(bill);
    }

    public Bill updateBill(Long id, String username, Bill details, MultipartFile file) throws IOException {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
        if (!bill.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized");
        }

        bill.setName(details.getName());
        bill.setAmount(details.getAmount());
        bill.setDueDate(details.getDueDate());
        bill.setPaid(details.isPaid());
        bill.setCategory(details.getCategory());

        if (file != null && !file.isEmpty()) {
            String path = saveBillProof(file);
            bill.setBillImage(path);
        }

        return billRepository.save(bill);
    }

    public Bill markAsPaid(Long id, String username) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
        if (!bill.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized");
        }
        bill.setPaid(true);
        return billRepository.save(bill);
    }

    public void deleteBill(Long id, String username) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
        if (!bill.getUser().getUsername().equals(username)) {
            throw new SecurityException("Unauthorized");
        }
        billRepository.delete(bill);
    }

    private String saveBillProof(MultipartFile file) throws IOException {
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);
        Files.write(filePath, file.getBytes());

        return "/uploads/" + fileName;
    }
}
