package com.ims.service;

import com.ims.dto.IPRDetailDTO;
import com.ims.dto.ItemDTO;
import com.ims.dto.ProcurementDetailDTO;
import com.ims.dto.ToTPartnerDTO;
import com.ims.dto.TrialStakeholderDTO;
import com.ims.exception.ResourceNotFoundException;
import com.ims.model.Item;
import com.ims.model.Notification;
import com.ims.model.ToTPartner;
import com.ims.model.TrialStakeholder;
import com.ims.model.ProcurementDetail;
import com.ims.model.IPRDetail;
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
        private final TrialStakeholderRepository trialStakeholderRepository;
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

                // Data isolation: ADMIN sees every item, everyone else only sees their own.
                User current = currentUser();
                Long ownerId = (current != null && current.getRole() != User.Role.ADMIN)
                        ? current.getId() : null;

                Page<Item> itemPage = itemRepository.findAllWithFilters(
                        ownerId,
                        nullIfBlank(search), nullIfBlank(category),
                        devStatus, tot, ipr, trials, pageable);

                return itemPage.map(this::toSummary);
        }

        /* ── GET BY ID ── */
        @Transactional(readOnly = true)
        @Cacheable(value = "item-detail", key = "#id")
        public ItemDTO.Response getItemById(Long id) {
                Item item = findById(id);
                assertAccess(item);
                return toResponse(item);
        }

        /* Throws if the current non-admin user does not own this item */
        private void assertAccess(Item item) {
                User current = currentUser();
                if (current == null || current.getRole() == User.Role.ADMIN) return;
                if (item.getCreatedBy() == null || !item.getCreatedBy().getId().equals(current.getId())) {
                        throw new org.springframework.security.access.AccessDeniedException(
                                "You do not have access to this item");
                }
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

                saveTotPartners(
                        saved,
                        request.getTotPartners()
                );
                saveTrialStakeholders(
                        saved,
                        request.getTrialStakeholders()
                );

                saveProcurementDetails(
                        saved,
                        request.getProcurementDetails()
                );

                saveIprDetail(
                        saved,
                        request.getIprDetail()
                );
                notificationService.createNotification(
                        "Item added successfully",
                        saved.getName() + " has been added to the system.",
                        Notification.NotificationType.ITEM_ADDED,
                        saved.getId(), saved.getName(),
                        saved.getCreatedBy() != null ? saved.getCreatedBy().getId() : null
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
                assertAccess(existing);

                // Check code uniqueness if code changed
                if (!existing.getCode().equals(request.getCode())
                        && itemRepository.existsByCode(request.getCode())) {
                        throw new IllegalArgumentException(
                                "Item with code '" + request.getCode() + "' already exists");
                }

                String oldDevStatus = existing.getDevelopmentStatus() != null
                        ? formatEnum(existing.getDevelopmentStatus()) : "";
                String oldTotStatus = existing.getTotStatus() != null
                        ? formatEnum(existing.getTotStatus()) : "";
                String oldIprStatus = existing.getIprStatus() != null
                        ? formatEnum(existing.getIprStatus()) : "";
                String oldTrialsStatus = existing.getTrialsStatus() != null
                        ? formatEnum(existing.getTrialsStatus()) : "";
                int oldDocCount = existing.getDocumentation() != null ? existing.getDocumentation().size() : 0;
                int oldProcurementCount = procurementDetailRepository.findByItemId(id).size();

                applyRequest(existing, request);
                Item saved = itemRepository.save(existing);

                saveTotPartners(
                        saved,
                        request.getTotPartners()
                );
                saveTrialStakeholders(
                        saved,
                        request.getTrialStakeholders()
                );

                saveProcurementDetails(
                        saved,
                        request.getProcurementDetails()
                );

                saveIprDetail(
                        saved,
                        request.getIprDetail()
                );

                Long ownerId = saved.getCreatedBy() != null ? saved.getCreatedBy().getId() : null;
                List<String> changes = new java.util.ArrayList<>();

                // Development status changed
                if (request.getDevelopmentStatus() != null
                        && !request.getDevelopmentStatus().equals(oldDevStatus)) {
                        changes.add("development status changed to " + formatEnum(saved.getDevelopmentStatus()));
                }

                // ToT (transfer of technology) status changed
                String newTotStatus = saved.getTotStatus() != null ? formatEnum(saved.getTotStatus()) : "";
                if (!newTotStatus.isEmpty() && !newTotStatus.equals(oldTotStatus)) {
                        changes.add("ToT status changed to " + newTotStatus);
                }

                // IPR status changed
                String newIprStatus = saved.getIprStatus() != null ? formatEnum(saved.getIprStatus()) : "";
                if (!newIprStatus.isEmpty() && !newIprStatus.equals(oldIprStatus)) {
                        changes.add("IPR status changed to " + newIprStatus);
                }

                // Trials status changed
                String newTrialsStatus = saved.getTrialsStatus() != null ? formatEnum(saved.getTrialsStatus()) : "";
                if (!newTrialsStatus.isEmpty() && !newTrialsStatus.equals(oldTrialsStatus)) {
                        changes.add("trial status changed to " + newTrialsStatus);
                }

                // New documentation added
                int newDocCount = saved.getDocumentation() != null ? saved.getDocumentation().size() : 0;
                if (newDocCount > oldDocCount) {
                        changes.add((newDocCount - oldDocCount) + " new document(s) added");
                }

                // New procurement entries added
                int newProcurementCount = request.getProcurementDetails() != null
                        ? request.getProcurementDetails().size() : 0;
                if (newProcurementCount > oldProcurementCount) {
                        changes.add("a new procurement entry was added");
                }

                // Fire a single combined notification summarizing everything that changed in this save
                if (!changes.isEmpty()) {
                        notificationService.createNotification(
                                "Item updated",
                                saved.getName() + ": " + String.join("; ", changes) + ".",
                                Notification.NotificationType.STATUS_CHANGED,
                                saved.getId(), saved.getName(), ownerId
                        );
                }

                log.info("Item updated: {} ({})", saved.getName(), saved.getCode());
                return toResponse(saved);
        }

        private void saveTrialStakeholders(
                Item item,
                List<TrialStakeholderDTO> stakeholders) {

                trialStakeholderRepository.deleteAll(
                        trialStakeholderRepository.findByItemId(item.getId())
                );

                if (stakeholders == null) return;

                stakeholders.forEach(dto -> {

                        TrialStakeholder t = new TrialStakeholder();

                        t.setItem(item);
                        t.setStakeholderName(dto.getStakeholderName());
                        t.setSampleRequestDate(dto.getSampleRequestDate());
                        t.setSampleSubmissionDate(dto.getSampleSubmissionDate());
                        t.setFeedback(dto.getFeedback());
                        t.setCorrection(dto.getCorrection());
                        t.setFurtherAction(dto.getFurtherAction());
                        t.setStatus(parseEnum(TrialStakeholder.Status.class, dto.getStatus()) != null
                                ? parseEnum(TrialStakeholder.Status.class, dto.getStatus())
                                : TrialStakeholder.Status.NOT_STARTED);

                        trialStakeholderRepository.save(t);
                });

                // Always re-derive the item's overall trials status from its stakeholders
                // so the dashboard and item list always reflect individual stakeholder statuses
                if (stakeholders != null && !stakeholders.isEmpty()) {
                        item.setTrialsStatus(deriveTrialsStatus(stakeholders));
                        itemRepository.save(item);
                }
        }

        /* Aggregate a list of stakeholder-level statuses into one overall Item.TrialsStatus */
        private Item.TrialsStatus deriveTrialsStatus(List<TrialStakeholderDTO> stakeholders) {
                List<TrialStakeholder.Status> statuses = stakeholders.stream()
                        .map(s -> {
                                TrialStakeholder.Status st = parseEnum(TrialStakeholder.Status.class, s.getStatus());
                                return st != null ? st : TrialStakeholder.Status.NOT_STARTED;
                        })
                        .toList();

                if (statuses.stream().allMatch(s -> s == TrialStakeholder.Status.COMPLETED)) {
                        return Item.TrialsStatus.COMPLETED;
                }
                if (statuses.stream().anyMatch(s -> s == TrialStakeholder.Status.ON_HOLD)) {
                        return Item.TrialsStatus.ON_HOLD;
                }
                if (statuses.stream().anyMatch(s -> s == TrialStakeholder.Status.IN_PROGRESS
                                || s == TrialStakeholder.Status.TESTING)) {
                        return Item.TrialsStatus.IN_PROGRESS;
                }
                return Item.TrialsStatus.PENDING;
        }

        private void saveTotPartners(Item item, List<ToTPartnerDTO> partners) {

                totPartnerRepository.deleteAll(
                        totPartnerRepository.findByItemId(item.getId())
                );

                if (partners == null) return;

                partners.forEach(dto -> {

                        ToTPartner p = new ToTPartner();

                        p.setItem(item);
                        p.setPartnerName(dto.getPartnerName());
                        p.setTotCertificate(dto.getTotCertificate());
                        p.setSampleSubmittedForTac(dto.getSampleSubmittedForTac());
                        p.setLatotSignature(dto.getLatotSignature());

                        totPartnerRepository.save(p);
                });
        }

        private void saveProcurementDetails(
                Item item,
                List<ProcurementDetailDTO> details) {

                procurementDetailRepository.deleteAll(
                        procurementDetailRepository.findByItemId(item.getId())
                );

                if (details == null) return;

                details.forEach(dto -> {

                        ProcurementDetail p = new ProcurementDetail();

                        p.setItem(item);
                        p.setOrganisationName(dto.getOrganisationName());
                        p.setItemsProcured(dto.getItemsProcured());
                        p.setOrderNumber(dto.getOrderNumber());
                        p.setOrderDate(dto.getOrderDate());

                        procurementDetailRepository.save(p);
                });
        }

        private void saveIprDetail(Item item, IPRDetailDTO dto) {

                if (dto == null) {
                        return;
                }

                IPRDetail ipr = iprDetailRepository
                        .findByItemId(item.getId())
                        .orElse(new IPRDetail());

                ipr.setItem(item);

                ipr.setPatentFiled(dto.getPatentFiled());
                ipr.setPatentGranted(dto.getPatentGranted());
                ipr.setPatentNumber(dto.getPatentNumber());
                ipr.setPatentGrantedNumber(dto.getPatentGrantedNumber());

                ipr.setTrademarkFiled(dto.getTrademarkFiled());
                ipr.setTrademarkGranted(dto.getTrademarkGranted());
                ipr.setTrademarkNumber(dto.getTrademarkNumber());
                ipr.setTrademarkGrantedNumber(dto.getTrademarkGrantedNumber());

                ipr.setDesignFiled(dto.getDesignFiled());
                ipr.setDesignGranted(dto.getDesignGranted());
                ipr.setDesignNumber(dto.getDesignNumber());
                ipr.setDesignGrantedNumber(dto.getDesignGrantedNumber());

                iprDetailRepository.save(ipr);

                // Build a human-readable label of which IP types are filed/granted, e.g. "Patent, Trademark"
                List<String> types = new java.util.ArrayList<>();
                if (Boolean.TRUE.equals(dto.getPatentFiled()) || Boolean.TRUE.equals(dto.getPatentGranted())) {
                        types.add("Patent");
                }
                if (Boolean.TRUE.equals(dto.getTrademarkFiled()) || Boolean.TRUE.equals(dto.getTrademarkGranted())) {
                        types.add("Trademark");
                }
                if (Boolean.TRUE.equals(dto.getDesignFiled()) || Boolean.TRUE.equals(dto.getDesignGranted())) {
                        types.add("Design");
                }
                item.setIprTypesLabel(types.isEmpty() ? null : String.join(", ", types));

                // Auto-derive the item's overall IPR status from the detail flags,
                // unless the caller already set an explicit status on the item itself.
                if (item.getIprStatus() == null) {
                        boolean anyGranted = Boolean.TRUE.equals(dto.getPatentGranted())
                                        || Boolean.TRUE.equals(dto.getTrademarkGranted())
                                        || Boolean.TRUE.equals(dto.getDesignGranted());
                        boolean anyFiled = Boolean.TRUE.equals(dto.getPatentFiled())
                                        || Boolean.TRUE.equals(dto.getTrademarkFiled())
                                        || Boolean.TRUE.equals(dto.getDesignFiled());
                        boolean trademarkOnly = Boolean.TRUE.equals(dto.getTrademarkFiled())
                                        && !Boolean.TRUE.equals(dto.getPatentFiled())
                                        && !Boolean.TRUE.equals(dto.getDesignFiled());

                        if (anyGranted) {
                                item.setIprStatus(Item.IPRStatus.GRANTED);
                        } else if (trademarkOnly) {
                                item.setIprStatus(Item.IPRStatus.TRADEMARK);
                        } else if (anyFiled) {
                                item.setIprStatus(Item.IPRStatus.PATENT_FILED);
                        } else {
                                item.setIprStatus(Item.IPRStatus.NOT_FILED);
                        }
                }
                itemRepository.save(item);
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
                assertAccess(item);
                Long ownerId = item.getCreatedBy() != null ? item.getCreatedBy().getId() : null;
                String name = item.getName();
                itemRepository.delete(item);
                notificationService.createNotification(
                        "Item deleted",
                        name + " has been removed from the system.",
                        Notification.NotificationType.GENERAL,
                        null, name, ownerId
                );
                log.info("Item deleted: {} ({})", name, item.getCode());
        }

        /* ── UPLOAD IMAGE ── */
        @Transactional
        @CacheEvict(value = "item-detail", key = "#id")
        public ItemDTO.Response uploadImage(Long id, MultipartFile file) throws IOException {
                Item item = findById(id);
                assertAccess(item);

                String ext      = getExtension(file.getOriginalFilename());
                String filename = UUID.randomUUID() + "." + ext;
                Path uploadPath = Paths.get("uploads");
                Files.createDirectories(uploadPath);
                Files.copy(file.getInputStream(), uploadPath.resolve(filename),
                        StandardCopyOption.REPLACE_EXISTING);

                item.setImageUrl("/uploads/" + filename);
                Item saved = itemRepository.save(item);
                notificationService.createNotification(
                        "Image uploaded",
                        "A new image has been uploaded for " + saved.getName(),
                        Notification.NotificationType.DOCUMENT_UPLOAD,
                        saved.getId(), saved.getName(),
                        saved.getCreatedBy() != null ? saved.getCreatedBy().getId() : null
                );
                return toResponse(saved);
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
                        .totDocumentsFiled(r.getTotDocumentsFiled() != null ? r.getTotDocumentsFiled() : new java.util.ArrayList<>())
                        .trialsStatus(parseEnum(Item.TrialsStatus.class, r.getTrialsStatus()))
                        .sampleRequestDate(r.getSampleRequestDate())
                        .sampleSubmissionDate(r.getSampleSubmissionDate())
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
                item.getTotDocumentsFiled().clear();

                if (r.getTotDocumentsFiled() != null) {
                        item.getTotDocumentsFiled().addAll(
                                r.getTotDocumentsFiled()
                        );
                }
                // Only overwrite trialsStatus if the caller explicitly provided one
                if (r.getTrialsStatus() != null && !r.getTrialsStatus().isBlank()) {
                        item.setTrialsStatus(parseEnum(Item.TrialsStatus.class, r.getTrialsStatus()));
                }
                item.setSampleRequestDate(r.getSampleRequestDate());
                item.setSampleSubmissionDate(r.getSampleSubmissionDate());
                item.setIprStatus(parseEnum(Item.IPRStatus.class, r.getIprStatus()));
                item.setPatentNumber(r.getPatentNumber());
                item.setFilingDate(r.getFilingDate());
                item.getDocumentation().clear();

                if (r.getDocumentation() != null) {
                        item.getDocumentation().addAll(
                                r.getDocumentation()
                        );
                }                item.setCrbfCount(r.getCrbfCount());
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
                List<String> stakeholderNames = trialStakeholderRepository.findByItemId(item.getId())
                        .stream()
                        .map(TrialStakeholder::getStakeholderName)
                        .filter(n -> n != null && !n.isBlank())
                        .toList();

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
                        .iprStatusLabel(item.getIprTypesLabel() != null
                                ? item.getIprTypesLabel() : formatEnum(item.getIprStatus()))
                        .trialsStatus(formatEnum(item.getTrialsStatus()))
                        .trialStakeholderNames(stakeholderNames)
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

                List<TrialStakeholderDTO> trialStakeholders =
                        trialStakeholderRepository.findByItemId(item.getId())
                                .stream()
                                .map(t -> TrialStakeholderDTO.builder()
                                        .id(t.getId())
                                        .stakeholderName(t.getStakeholderName())
                                        .sampleRequestDate(t.getSampleRequestDate())
                                        .sampleSubmissionDate(t.getSampleSubmissionDate())
                                        .feedback(t.getFeedback())
                                        .correction(t.getCorrection())
                                        .furtherAction(t.getFurtherAction())
                                        .status(formatEnum(t.getStatus()))
                                        .build())
                                .toList();
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
                        .totDocumentsFiled(item.getTotDocumentsFiled())
                        .trialsStatus(formatEnum(item.getTrialsStatus()))
                        .sampleRequestDate(item.getSampleRequestDate())
                        .sampleSubmissionDate(item.getSampleSubmissionDate())
                        .trialStakeholders(trialStakeholders)
                        .iprStatus(formatEnum(item.getIprStatus()))
                        .iprStatusLabel(item.getIprTypesLabel() != null
                                ? item.getIprTypesLabel() : formatEnum(item.getIprStatus()))
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
                        case "Filed"              -> "FILED";
                        case "To Be Filed"        -> "TO_BE_FILED";
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
                        case "FILED"            -> "Filed";
                        case "TO_BE_FILED"      -> "To Be Filed";
                        case "PATENT_FILED"     -> "Patent Filed";
                        case "GRANTED"          -> "Granted";
                        case "TRADEMARK"        -> "Trademark";
                        case "UNDER_REVIEW"     -> "Under Review";
                        case "NOT_FILED"        -> "Not Filed";
                        case "PENDING"          -> "Pending";
                        case "TESTING"          -> "Testing";
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