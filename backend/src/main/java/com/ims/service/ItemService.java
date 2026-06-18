package com.ims.service;

import com.ims.dto.IPRDetailDTO;
import com.ims.dto.ItemDTO;
import com.ims.dto.ProcurementDetailDTO;
import com.ims.dto.ToTPartnerDTO;
import com.ims.exception.ResourceNotFoundException;
import com.ims.model.Item;
import com.ims.model.Notification;
import com.ims.model.User;
import com.ims.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemService {

    private final ItemRepository       itemRepository;
    private final UserRepository       userRepository;
    private final NotificationService  notificationService;
    private final ToTPartnerRepository totPartnerRepository;
    private final ProcurementDetailRepository procurementDetailRepository;
    private final IPRDetailRepository iprDetailRepository;

    /* ── GET ALL with filters ── */
    @Transactional(readOnly = true)
    public Page<ItemDTO.Summary> getAllItems(
            String search, String category,
            String developmentStatus, String totStatus,
            String iprStatus, String trialsStatus,
            int page, int size, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Item.DevelopmentStatus devStatus = parseEnum(Item.DevelopmentStatus.class, developmentStatus);
        Item.ToTStatus         tot       = parseEnum(Item.ToTStatus.class,        totStatus);
        Item.IPRStatus         ipr       = parseEnum(Item.IPRStatus.class,        iprStatus);
        Item.TrialsStatus      trials    = parseEnum(Item.TrialsStatus.class,     trialsStatus);

        Page<Item> itemPage = itemRepository.findAllWithFilters(
                nullIfBlank(search), nullIfBlank(category),
                devStatus, tot, ipr, trials, pageable);

        return itemPage.map(this::toSummary);
    }

    /* ── GET BY ID ── */
    @Transactional(readOnly = true)
    @Cacheable(value = "item-detail", key = "#id")
    public ItemDTO.Response getItemById(Long id) {
        Item item = findById(id);
        return toResponse(item);
    }

    /* ── CREATE ── */
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "items",     allEntries = true),
            @CacheEvict(value = "dashboard", allEntries = true)
    })
    public ItemDTO.Response createItem(ItemDTO.Request request) {
        if (itemRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException(
                    "Item with code '" + request.getCode() + "' already exists");
        }

        Item item = fromRequest(request);
        item.setCreatedBy(currentUser());
        Item saved = itemRepository.save(item);

        notificationService.createNotification(
                "Item added successfully",
                saved.getName() + " has been added to the system.",
                Notification.NotificationType.ITEM_ADDED,
                saved.getId(), saved.getName()
        );

        log.info("Item created: {} ({})", saved.getName(), saved.getCode());
        return toResponse(saved);
    }

    /* ── UPDATE ── */
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "items",       allEntries = true),
            @CacheEvict(value = "item-detail", key = "#id"),
            @CacheEvict(value = "dashboard",   allEntries = true)
    })
    public ItemDTO.Response updateItem(Long id, ItemDTO.Request request) {
        Item existing = findById(id);

        // Check code uniqueness if code changed
        if (!existing.getCode().equals(request.getCode())
                && itemRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException(
                    "Item with code '" + request.getCode() + "' already exists");
        }

        String oldDevStatus = existing.getDevelopmentStatus() != null
                ? formatEnum(existing.getDevelopmentStatus()) : "";

        applyRequest(existing, request);
        Item saved = itemRepository.save(existing);

        // Notify if development status changed
        if (request.getDevelopmentStatus() != null
                && !request.getDevelopmentStatus().equals(oldDevStatus)) {
            notificationService.createNotification(
                    "Development status changed",
                    "Development status of " + saved.getName() +
                            " changed to " + formatEnum(saved.getDevelopmentStatus()),
                    Notification.NotificationType.STATUS_CHANGED,
                    saved.getId(), saved.getName()
            );
        }

        log.info("Item updated: {} ({})", saved.getName(), saved.getCode());
        return toResponse(saved);
    }

    /* ── DELETE ── */
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "items",       allEntries = true),
            @CacheEvict(value = "item-detail", key = "#id"),
            @CacheEvict(value = "dashboard",   allEntries = true)
    })
    public void deleteItem(Long id) {
        Item item = findById(id);
        itemRepository.delete(item);
        log.info("Item deleted: {} ({})", item.getName(), item.getCode());
    }

    /* ── UPLOAD IMAGE ── */
    @Transactional
    @CacheEvict(value = "item-detail", key = "#id")
    public ItemDTO.Response uploadImage(Long id, MultipartFile file) throws IOException {
        Item item = findById(id);

        String ext      = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "." + ext;
        Path uploadPath = Paths.get("uploads");
        Files.createDirectories(uploadPath);
        Files.copy(file.getInputStream(), uploadPath.resolve(filename),
                StandardCopyOption.REPLACE_EXISTING);

        item.setImageUrl("/uploads/" + filename);
        return toResponse(itemRepository.save(item));
    }

    /* ── Helpers ── */
    private Item findById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", id));
    }

    private User currentUser() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    private Item fromRequest(ItemDTO.Request r) {
        return Item.builder()
                .name(r.getName())
                .code(r.getCode())
                .category(r.getCategory())
                .description(r.getDescription())
                .priority(parseEnum(Item.Priority.class, r.getPriority()))
                .expectedCompletionDate(r.getExpectedCompletionDate())
                .developmentStatus(parseEnum(Item.DevelopmentStatus.class, r.getDevelopmentStatus()))
                .developmentDate(r.getDevelopmentDate())
                .remarks(r.getRemarks())
                .totStatus(parseEnum(Item.ToTStatus.class, r.getTotStatus()))
                .totDocumentNo(r.getTotDocumentNo())
                .filledDate(r.getFilledDate())
                .trialsStatus(parseEnum(Item.TrialsStatus.class, r.getTrialsStatus()))
                .sampleRequestDate(r.getSampleRequestDate())
                .sampleSubmissionDate(r.getSampleSubmissionDate())
                .trialStakeholders(r.getTrialStakeholders() != null ? r.getTrialStakeholders() : new java.util.ArrayList<>())
                .iprStatus(parseEnum(Item.IPRStatus.class, r.getIprStatus()))
                .patentNumber(r.getPatentNumber())
                .filingDate(r.getFilingDate())
                .documentation(r.getDocumentation() != null ? r.getDocumentation() : new java.util.ArrayList<>())
                .crbfCount(r.getCrbfCount())
                .ssbCount(r.getSsbCount())
                .weight(r.getWeight())
                .size(r.getSize())
                .material(r.getMaterial())
                .color(r.getColor())
                .unitCost(r.getUnitCost())
                .vendor(r.getVendor())
                .warranty(r.getWarranty())
                .build();
    }

    private void applyRequest(Item item, ItemDTO.Request r) {
        item.setName(r.getName());
        item.setCode(r.getCode());
        item.setCategory(r.getCategory());
        item.setDescription(r.getDescription());
        item.setPriority(parseEnum(Item.Priority.class, r.getPriority()));
        item.setExpectedCompletionDate(r.getExpectedCompletionDate());
        item.setDevelopmentStatus(parseEnum(Item.DevelopmentStatus.class, r.getDevelopmentStatus()));
        item.setDevelopmentDate(r.getDevelopmentDate());
        item.setRemarks(r.getRemarks());
        item.setTotStatus(parseEnum(Item.ToTStatus.class, r.getTotStatus()));
        item.setTotDocumentNo(r.getTotDocumentNo());
        item.setFilledDate(r.getFilledDate());
        item.setTrialsStatus(parseEnum(Item.TrialsStatus.class, r.getTrialsStatus()));
        item.setSampleRequestDate(r.getSampleRequestDate());
        item.setSampleSubmissionDate(r.getSampleSubmissionDate());
        if (r.getTrialStakeholders() != null) item.setTrialStakeholders(r.getTrialStakeholders());
        item.setIprStatus(parseEnum(Item.IPRStatus.class, r.getIprStatus()));
        item.setPatentNumber(r.getPatentNumber());
        item.setFilingDate(r.getFilingDate());
        if (r.getDocumentation() != null) item.setDocumentation(r.getDocumentation());
        item.setCrbfCount(r.getCrbfCount());
        item.setSsbCount(r.getSsbCount());
        item.setWeight(r.getWeight());
        item.setSize(r.getSize());
        item.setMaterial(r.getMaterial());
        item.setColor(r.getColor());
        item.setUnitCost(r.getUnitCost());
        item.setVendor(r.getVendor());
        item.setWarranty(r.getWarranty());
    }

    private ItemDTO.Summary toSummary(Item item) {
        return ItemDTO.Summary.builder()
                .id(item.getId())
                .name(item.getName())
                .code(item.getCode())
                .category(item.getCategory())
                .description(item.getDescription())
                .imageUrl(item.getImageUrl())
                .priority(formatEnum(item.getPriority()))
                .developmentStatus(formatEnum(item.getDevelopmentStatus()))
                .totStatus(formatEnum(item.getTotStatus()))
                .iprStatus(formatEnum(item.getIprStatus()))
                .trialsStatus(formatEnum(item.getTrialsStatus()))
                .updatedAt(item.getUpdatedAt())
                .build();
    }

    private ItemDTO.Response toResponse(Item item) {

        List<ToTPartnerDTO> totPartners =
                totPartnerRepository.findByItemId(item.getId())
                        .stream()
                        .map(t -> ToTPartnerDTO.builder()
                                .id(t.getId())
                                .partnerName(t.getPartnerName())
                                .totCertificate(t.getTotCertificate())
                                .sampleSubmittedForTac(t.getSampleSubmittedForTac())
                                .latotSignature(t.getLatotSignature())
                                .build())
                        .toList();

        List<ProcurementDetailDTO> procurementDetails =
                procurementDetailRepository.findByItemId(item.getId())
                        .stream()
                        .map(p -> ProcurementDetailDTO.builder()
                                .id(p.getId())
                                .organisationName(p.getOrganisationName())
                                .itemsProcured(p.getItemsProcured())
                                .orderNumber(p.getOrderNumber())
                                .orderDate(p.getOrderDate())
                                .build())
                        .toList();

        IPRDetailDTO iprDetail = iprDetailRepository.findByItemId(item.getId())
                .map(i -> IPRDetailDTO.builder()
                        .patentFiled(i.getPatentFiled())
                        .patentGranted(i.getPatentGranted())
                        .patentNumber(i.getPatentNumber())
                        .patentGrantedNumber(i.getPatentGrantedNumber())
                        .trademarkFiled(i.getTrademarkFiled())
                        .trademarkGranted(i.getTrademarkGranted())
                        .trademarkNumber(i.getTrademarkNumber())
                        .trademarkGrantedNumber(i.getTrademarkGrantedNumber())
                        .designFiled(i.getDesignFiled())
                        .designGranted(i.getDesignGranted())
                        .designNumber(i.getDesignNumber())
                        .designGrantedNumber(i.getDesignGrantedNumber())
                        .build())
                .orElse(null);

        return ItemDTO.Response.builder()
                .id(item.getId())
                .name(item.getName())
                .code(item.getCode())
                .category(item.getCategory())
                .description(item.getDescription())
                .priority(formatEnum(item.getPriority()))
                .imageUrl(item.getImageUrl())
                .expectedCompletionDate(item.getExpectedCompletionDate())
                .developmentStatus(formatEnum(item.getDevelopmentStatus()))
                .developmentDate(item.getDevelopmentDate())
                .remarks(item.getRemarks())
                .totStatus(formatEnum(item.getTotStatus()))
                .totDocumentNo(item.getTotDocumentNo())
                .filledDate(item.getFilledDate())
                .trialsStatus(formatEnum(item.getTrialsStatus()))
                .sampleRequestDate(item.getSampleRequestDate())
                .sampleSubmissionDate(item.getSampleSubmissionDate())
                .trialStakeholders(item.getTrialStakeholders())
                .iprStatus(formatEnum(item.getIprStatus()))
                .patentNumber(item.getPatentNumber())
                .filingDate(item.getFilingDate())
                .documentation(item.getDocumentation())
                .crbfCount(item.getCrbfCount())
                .ssbCount(item.getSsbCount())
                .weight(item.getWeight())
                .size(item.getSize())
                .material(item.getMaterial())
                .color(item.getColor())
                .unitCost(item.getUnitCost())
                .vendor(item.getVendor())
                .warranty(item.getWarranty())
                .createdBy(item.getCreatedBy() != null ? item.getCreatedBy().getName() : null)
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .totPartners(totPartners)
                .procurementDetails(procurementDetails)
                .iprDetail(iprDetail)
                .build();
    }

    private <T extends Enum<T>> T parseEnum(Class<T> clazz, String value) {
        if (value == null || value.isBlank()) return null;
        // Try reverse-lookup from human-readable display strings first
        String mapped = switch (value.trim()) {
            case "Developed"          -> "DEVELOPED";
            case "In Progress"        -> "IN_PROGRESS";
            case "Under Development"  -> "UNDER_DEVELOPMENT";
            case "Not Started"        -> "NOT_STARTED";
            case "Filled (TnF)"       -> "FILLED_TNF";
            case "Filled (TAC)"       -> "FILLED_TAC";
            case "To Be Filled"       -> "TO_BE_FILLED";
            case "Filed"              -> "FILLED_TNF";   // frontend "Filed" → FILLED_TNF
            case "Not Applicable"     -> "NOT_APPLICABLE";
            case "Patent Filed"       -> "PATENT_FILED";
            case "Granted"            -> "GRANTED";
            case "Trademark"          -> "TRADEMARK";
            case "Under Review"       -> "UNDER_REVIEW";
            case "Not Filed"          -> "NOT_FILED";
            case "Pending"            -> "PENDING";
            case "Completed"          -> "COMPLETED";
            case "On Hold"            -> "ON_HOLD";
            case "High"               -> "HIGH";
            case "Medium"             -> "MEDIUM";
            case "Low"                -> "LOW";
            default -> value.toUpperCase()
                    .replace(" ", "_")
                    .replace("(", "")
                    .replace(")", "")
                    .replace("-", "_");
        };
        try {
            return Enum.valueOf(clazz, mapped);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private String formatEnum(Enum<?> e) {
        if (e == null) return null;
        return switch (e.name()) {
            case "DEVELOPED"        -> "Developed";
            case "IN_PROGRESS"      -> "In Progress";
            case "UNDER_DEVELOPMENT"-> "Under Development";
            case "NOT_STARTED"      -> "Not Started";
            case "FILLED_TNF"       -> "Filled (TnF)";
            case "FILLED_TAC"       -> "Filled (TAC)";
            case "TO_BE_FILLED"     -> "To Be Filled";
            case "NOT_APPLICABLE"   -> "Not Applicable";
            case "PATENT_FILED"     -> "Patent Filed";
            case "GRANTED"          -> "Granted";
            case "TRADEMARK"        -> "Trademark";
            case "UNDER_REVIEW"     -> "Under Review";
            case "NOT_FILED"        -> "Not Filed";
            case "PENDING"          -> "Pending";
            case "COMPLETED"        -> "Completed";
            case "ON_HOLD"          -> "On Hold";
            case "HIGH"             -> "High";
            case "MEDIUM"           -> "Medium";
            case "LOW"              -> "Low";
            default -> e.name();
        };
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    private String getExtension(String filename) {
        if (filename == null) return "jpg";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "jpg";
    }
}