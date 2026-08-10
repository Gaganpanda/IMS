package com.ims.service;
import java.util.ArrayList;
import com.ims.dto.IPRDetailDTO;
import com.ims.dto.ItemDTO;
import com.ims.dto.ItemDocumentDTO;
import com.ims.dto.ItemVariantDTO;
import com.ims.dto.ProcurementDetailDTO;
import com.ims.dto.ToTPartnerDTO;
import com.ims.dto.TrialStakeholderDTO;
import com.ims.exception.ResourceNotFoundException;
import com.ims.model.Item;
import com.ims.model.ItemDocument;
import com.ims.model.ItemVariant;
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
import org.springframework.beans.factory.annotation.Value;
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

        private final ItemRepository itemRepository;
        private final UserRepository userRepository;
        private final NotificationService notificationService;
        private final ToTPartnerRepository totPartnerRepository;
        private final TrialStakeholderRepository trialStakeholderRepository;
        private final ProcurementDetailRepository procurementDetailRepository;
        private final IPRDetailRepository iprDetailRepository;
        private final ItemVariantRepository itemVariantRepository;
        private final ItemDocumentRepository itemDocumentRepository;

        @Value("${app.upload.dir:uploads/}")
        private String uploadDir;

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
                Item.ToTStatus tot = parseEnum(Item.ToTStatus.class, totStatus);

                // Map IPR filter string to iprDetailFilter key (joins IPRDetail table)
                String iprDetailFilter = mapIprFilter(iprStatus);

                // Map trials status to TrialStakeholder.Status (joins TrialStakeholder directly
                // — avoids item-level trialsStatus derivation-sync issues entirely)
                TrialStakeholder.Status trialsFilter = mapTrialsFilter(trialsStatus);

                // Data isolation: ADMIN sees every item, everyone else only sees their own.
                User current = currentUser();
                Long ownerId = (current != null && current.getRole() != User.Role.ADMIN)
                                ? current.getId()
                                : null;

                Page<Item> itemPage = itemRepository.findAllWithFilters(
                                ownerId,
                                nullIfBlank(search), nullIfBlank(category),
                                devStatus, tot, iprDetailFilter, trialsFilter, pageable);

                return itemPage.map(this::toSummary);
        }

        /** Maps frontend trials label → TrialStakeholder.Status */
        private TrialStakeholder.Status mapTrialsFilter(String value) {
                if (value == null || value.isBlank())
                        return null;
                return switch (value.trim()) {
                        case "Not Started" -> TrialStakeholder.Status.NOT_STARTED;
                        case "In Progress" -> TrialStakeholder.Status.IN_PROGRESS;
                        case "Testing" -> TrialStakeholder.Status.TESTING;
                        case "Completed" -> TrialStakeholder.Status.COMPLETED;
                        case "On Hold" -> TrialStakeholder.Status.ON_HOLD;
                        default -> null;
                };
        }

        /** Maps frontend iprStatus label → IPRDetail field key */
        private String mapIprFilter(String iprStatus) {
                if (iprStatus == null || iprStatus.isBlank())
                        return null;
                return switch (iprStatus.trim()) {
                        case "Patent Filed" -> "patentFiled";
                        case "Patent Granted" -> "patentGranted";
                        case "Trademark Filed" -> "trademarkFiled";
                        case "Trademark Granted" -> "trademarkGranted";
                        case "Design Filed" -> "designFiled";
                        case "Design Granted" -> "designGranted";
                        case "Copyright Filed" -> "copyrightFiled";
                        case "Copyright Granted" -> "copyrightGranted";
                        default -> null;
                };
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
                if (current == null || current.getRole() == User.Role.ADMIN)
                        return;
                if (item.getCreatedBy() == null || !item.getCreatedBy().getId().equals(current.getId())) {
                        throw new org.springframework.security.access.AccessDeniedException(
                                        "You do not have access to this item");
                }
        }

        /* ── CREATE ── */
        @Transactional
        @Caching(evict = {
                        @CacheEvict(value = "items", allEntries = true),
                        @CacheEvict(value = "dashboard", allEntries = true)
        })
        public ItemDTO.Response createItem(ItemDTO.Request request) {
                if (itemRepository.existsByName(request.getName())) {
                        throw new IllegalArgumentException(
                                        "Item with name '" + request.getName() + "' already exists");
                }

                Item item = fromRequest(request);
                item.setCreatedBy(currentUser());
                // Temporary unique placeholder so the initial insert satisfies the
                // NOT NULL/UNIQUE 'code' column; replaced below once the id is known.
                item.setCode("ITM-" + UUID.randomUUID());

                Item saved = itemRepository.save(item);
                saved.setCode(String.format("ITM%06d", saved.getId()));
                saved = itemRepository.save(saved);

                saveTotPartners(
                                saved,
                                request.getTotPartners());
                saveTrialStakeholders(
                                saved,
                                request.getTrialStakeholders());

                saveProcurementDetails(
                                saved,
                                request.getProcurementDetails());

                saveIprDetail(
                                saved,
                                request.getIprDetail());

                // NOTE: variants are intentionally NOT touched here — see updateItem
                // for the full explanation. A brand-new item never has variants yet
                // regardless (they're only created afterwards via convertToVariant).

                // Only "item created" notification is fired here — all other automatic
                // notifications have been intentionally removed. ToT validity
                // reminders are handled separately by the scheduled ToTReminderService.
                notificationService.createNotification(
                                "Item created",
                                saved.getName() + " has been added to the system.",
                                Notification.NotificationType.ITEM_ADDED,
                                saved.getId(), saved.getName(),
                                saved.getCreatedBy() != null ? saved.getCreatedBy().getId() : null);

                log.info("Item created: {}", saved.getName());
                return toResponse(saved);
        }

        /* ── UPDATE ── */
        @Transactional
        @Caching(evict = {
                        @CacheEvict(value = "items", allEntries = true),
                        @CacheEvict(value = "item-detail", key = "#id"),
                        @CacheEvict(value = "dashboard", allEntries = true)
        })
        public ItemDTO.Response updateItem(Long id, ItemDTO.Request request) {
                Item existing = findById(id);
                assertAccess(existing);

                // Check name uniqueness if name changed
                if (!existing.getName().equals(request.getName())
                                && itemRepository.existsByName(request.getName())) {
                        throw new IllegalArgumentException(
                                        "Item with name '" + request.getName() + "' already exists");
                }

                applyRequest(existing, request);
                Item saved = itemRepository.save(existing);

                saveTotPartners(
                                saved,
                                request.getTotPartners());
                saveTrialStakeholders(
                                saved,
                                request.getTrialStakeholders());

                saveProcurementDetails(
                                saved,
                                request.getProcurementDetails());

                saveIprDetail(
                                saved,
                                request.getIprDetail());

                // NOTE: variants are intentionally NOT touched here. Once an item
                // has variants, each one owns its own independent Basic Info/ToT/
                // IPR/Trial Stakeholders/Documentation/Procurement data (see
                // convertToVariant/createVariant/updateVariant below); re-deriving
                // them from request.getVariants() on every whole-item save would
                // wipe out that independent data.

                // Intentionally no "item updated" notification — per requirements, only
                // "item created" and ToT validity notifications should be generated.
                log.info("Item updated: {}", saved.getName());
                return toResponse(saved);
        }

        private void saveTrialStakeholders(
                        Item item,
                        List<TrialStakeholderDTO> stakeholders) {

                trialStakeholderRepository.deleteAll(
                                trialStakeholderRepository.findByItemId(item.getId()));

                if (stakeholders == null)
                        return;

                stakeholders.forEach(dto -> {

                        TrialStakeholder t = new TrialStakeholder();

                        t.setItem(item);
                        t.setStakeholderName(dto.getStakeholderName());
                        t.setContactPersonName(dto.getContactPersonName());
                        t.setStakeholderAddress(dto.getStakeholderAddress());
                        t.setStakeholderPhone(dto.getStakeholderPhone());
                        t.setSampleNo(dto.getSampleNo());
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

        /*
         * Aggregate a list of stakeholder-level statuses into one overall
         * Item.TrialsStatus
         */
        private Item.TrialsStatus deriveTrialsStatus(List<TrialStakeholderDTO> stakeholders) {
                List<TrialStakeholder.Status> statuses = stakeholders.stream()
                                .map(s -> {
                                        TrialStakeholder.Status st = parseEnum(TrialStakeholder.Status.class,
                                                        s.getStatus());
                                        return st != null ? st : TrialStakeholder.Status.NOT_STARTED;
                                })
                                .toList();

                if (statuses.stream().allMatch(s -> s == TrialStakeholder.Status.COMPLETED)) {
                        return Item.TrialsStatus.COMPLETED;
                }
                if (statuses.stream().anyMatch(s -> s == TrialStakeholder.Status.ON_HOLD)) {
                        return Item.TrialsStatus.ON_HOLD;
                }
                // If any stakeholder is Testing, overall = Testing
                if (statuses.stream().allMatch(
                                s -> s == TrialStakeholder.Status.TESTING || s == TrialStakeholder.Status.COMPLETED)) {
                        return Item.TrialsStatus.TESTING;
                }
                if (statuses.stream().anyMatch(s -> s == TrialStakeholder.Status.TESTING)) {
                        return Item.TrialsStatus.TESTING;
                }
                if (statuses.stream().anyMatch(s -> s == TrialStakeholder.Status.IN_PROGRESS)) {
                        return Item.TrialsStatus.IN_PROGRESS;
                }
                // All NOT_STARTED
                if (statuses.stream().allMatch(s -> s == TrialStakeholder.Status.NOT_STARTED)) {
                        return Item.TrialsStatus.PENDING;
                }
                return Item.TrialsStatus.PENDING;
        }

        private void saveTotPartners(Item item, List<ToTPartnerDTO> partners) {

                totPartnerRepository.deleteAll(
                                totPartnerRepository.findByItemId(item.getId()));

                if (partners == null)
                        return;

                partners.forEach(dto -> {

                        ToTPartner p = new ToTPartner();

                        p.setItem(item);
                        p.setTotFirm(dto.getTotFirm());
                        p.setLatotSigningDate(dto.getLatotSigningDate());
                        p.setSampleSubmissionForTechAbsorptionDate(dto.getSampleSubmissionForTechAbsorptionDate());
                        p.setTotCertificateDate(dto.getTotCertificateDate());
                        p.setTotValidityDate(dto.getTotValidityDate());

                        totPartnerRepository.save(p);
                });
        }

        /* Copies every scalar (non-collection) field from the DTO onto the variant
         * entity. Used by convertToVariant (seeding Variant 1 from the item),
         * createVariant in "blank"/"copy" mode, and updateVariant. */
        private void applyVariantScalarFields(ItemVariant v, ItemVariantDTO dto) {
                if (dto.getCategory() != null) v.setCategory(dto.getCategory());
                v.setDescription(dto.getDescription());
                if (dto.getInventor() != null) v.setInventor(dto.getInventor());
                if (dto.getProductDevCompletionDate() != null) v.setProductDevCompletionDate(dto.getProductDevCompletionDate());
                v.setImageUrl(dto.getImageUrl());

                v.setDevelopmentStatus(Item.DevelopmentStatus.fromString(dto.getDevelopmentStatus()));
                v.setTotStatus(Item.ToTStatus.fromString(dto.getTotStatus()));
                v.setIprStatus(Item.IPRStatus.fromString(dto.getIprStatus()));
                v.setTrialsStatus(Item.TrialsStatus.fromString(dto.getTrialsStatus()));

                if (dto.getDevelopmentDate() != null && !dto.getDevelopmentDate().isBlank()) {
                        try {
                                v.setDevelopmentDate(java.time.LocalDate.parse(dto.getDevelopmentDate()));
                        } catch (Exception ignored) {
                                v.setDevelopmentDate(null);
                        }
                } else {
                        v.setDevelopmentDate(null);
                }

                v.setTotDocumentNo(dto.getTotDocumentNo());
                v.setFilledDate(dto.getFilledDate());
                v.getTotDocumentsFiled().clear();
                if (dto.getTotDocumentsFiled() != null) v.getTotDocumentsFiled().addAll(dto.getTotDocumentsFiled());

                v.setSampleRequestDate(dto.getSampleRequestDate());
                v.setSampleSubmissionDate(dto.getSampleSubmissionDate());

                v.setIprTypesLabel(dto.getIprStatusLabel());

                v.getDocumentation().clear();
                if (dto.getDocumentation() != null) v.getDocumentation().addAll(dto.getDocumentation());

                v.setCrbfCount(dto.getCrbfCount());
                v.setSsbCount(dto.getSsbCount());

                v.setWeight(dto.getWeight());
                v.setSize(dto.getSize());
                v.setMaterial(dto.getMaterial());
                v.setColor(dto.getColor());
                v.setUnitCost(dto.getUnitCost());
                v.setVendor(dto.getVendor());
                v.setWarranty(dto.getWarranty());
                v.setRemarks(dto.getRemarks());
        }

        private void saveVariantTrialStakeholders(ItemVariant variant, List<TrialStakeholderDTO> stakeholders) {
                trialStakeholderRepository.deleteAll(
                                trialStakeholderRepository.findByItemVariantId(variant.getId()));
                if (stakeholders == null) return;
                stakeholders.forEach(dto -> {
                        TrialStakeholder t = new TrialStakeholder();
                        t.setItemVariant(variant);
                        t.setStakeholderName(dto.getStakeholderName());
                        t.setContactPersonName(dto.getContactPersonName());
                        t.setStakeholderAddress(dto.getStakeholderAddress());
                        t.setStakeholderPhone(dto.getStakeholderPhone());
                        t.setSampleNo(dto.getSampleNo());
                        t.setSampleRequestDate(dto.getSampleRequestDate());
                        t.setSampleSubmissionDate(dto.getSampleSubmissionDate());
                        t.setFeedback(dto.getFeedback());
                        t.setCorrection(dto.getCorrection());
                        t.setFurtherAction(dto.getFurtherAction());
                        TrialStakeholder.Status st = parseEnum(TrialStakeholder.Status.class, dto.getStatus());
                        t.setStatus(st != null ? st : TrialStakeholder.Status.NOT_STARTED);
                        trialStakeholderRepository.save(t);
                });
                if (!stakeholders.isEmpty()) {
                        variant.setTrialsStatus(deriveTrialsStatus(stakeholders));
                        itemVariantRepository.save(variant);
                }
        }

        private void saveVariantTotPartners(ItemVariant variant, List<ToTPartnerDTO> partners) {
                totPartnerRepository.deleteAll(
                                totPartnerRepository.findByItemVariantId(variant.getId()));
                if (partners == null) return;
                partners.forEach(dto -> {
                        ToTPartner p = new ToTPartner();
                        p.setItemVariant(variant);
                        p.setTotFirm(dto.getTotFirm());
                        p.setLatotSigningDate(dto.getLatotSigningDate());
                        p.setSampleSubmissionForTechAbsorptionDate(dto.getSampleSubmissionForTechAbsorptionDate());
                        p.setTotCertificateDate(dto.getTotCertificateDate());
                        p.setTotValidityDate(dto.getTotValidityDate());
                        totPartnerRepository.save(p);
                });
        }

        private void saveVariantProcurementDetails(ItemVariant variant, List<ProcurementDetailDTO> details) {
                procurementDetailRepository.deleteAll(
                                procurementDetailRepository.findByItemVariantId(variant.getId()));
                if (details == null) return;
                details.forEach(dto -> {
                        ProcurementDetail p = new ProcurementDetail();
                        p.setItemVariant(variant);
                        p.setProcurementAgency(dto.getProcurementAgency());
                        p.setTotFirmNo(dto.getTotFirmNo());
                        p.setNoOfItemProcured(dto.getNoOfItemProcured());
                        p.setProductionValue(dto.getProductionValue());
                        p.setOrderNumber(dto.getOrderNumber());
                        p.setOrderDate(dto.getOrderDate());
                        procurementDetailRepository.save(p);
                });
        }

        private void saveVariantIprDetail(ItemVariant variant, IPRDetailDTO dto) {
                if (dto == null) return;

                IPRDetail ipr = iprDetailRepository.findByItemVariantId(variant.getId()).orElse(new IPRDetail());
                ipr.setItemVariant(variant);

                ipr.setPatentFiled(dto.getPatentFiled());
                ipr.setPatentGranted(dto.getPatentGranted());
                ipr.setPatentInventor(dto.getPatentInventor());
                ipr.setPatentFilingNo(dto.getPatentFilingNo());
                ipr.setPatentFilingDate(dto.getPatentFilingDate());
                ipr.setPatentGrantNo(dto.getPatentGrantNo());
                ipr.setPatentGrantDate(dto.getPatentGrantDate());

                ipr.setTrademarkFiled(dto.getTrademarkFiled());
                ipr.setTrademarkGranted(dto.getTrademarkGranted());
                ipr.setTrademarkInventor(dto.getTrademarkInventor());
                ipr.setTrademarkFilingNo(dto.getTrademarkFilingNo());
                ipr.setTrademarkFilingDate(dto.getTrademarkFilingDate());
                ipr.setTrademarkGrantNo(dto.getTrademarkGrantNo());
                ipr.setTrademarkGrantDate(dto.getTrademarkGrantDate());

                ipr.setDesignFiled(dto.getDesignFiled());
                ipr.setDesignGranted(dto.getDesignGranted());
                ipr.setDesignInventor(dto.getDesignInventor());
                ipr.setDesignFilingNo(dto.getDesignFilingNo());
                ipr.setDesignFilingDate(dto.getDesignFilingDate());
                ipr.setDesignGrantNo(dto.getDesignGrantNo());
                ipr.setDesignGrantDate(dto.getDesignGrantDate());

                ipr.setCopyrightFiled(dto.getCopyrightFiled());
                ipr.setCopyrightGranted(dto.getCopyrightGranted());
                ipr.setCopyrightInventor(dto.getCopyrightInventor());
                ipr.setCopyrightFilingNo(dto.getCopyrightFilingNo());
                ipr.setCopyrightFilingDate(dto.getCopyrightFilingDate());
                ipr.setCopyrightGrantNo(dto.getCopyrightGrantNo());
                ipr.setCopyrightGrantDate(dto.getCopyrightGrantDate());

                iprDetailRepository.save(ipr);

                List<String> types = new java.util.ArrayList<>();
                if (Boolean.TRUE.equals(dto.getPatentFiled()) || Boolean.TRUE.equals(dto.getPatentGranted())) types.add("Patent");
                if (Boolean.TRUE.equals(dto.getTrademarkFiled()) || Boolean.TRUE.equals(dto.getTrademarkGranted())) types.add("Trademark");
                if (Boolean.TRUE.equals(dto.getDesignFiled()) || Boolean.TRUE.equals(dto.getDesignGranted())) types.add("Design");
                if (Boolean.TRUE.equals(dto.getCopyrightFiled()) || Boolean.TRUE.equals(dto.getCopyrightGranted())) types.add("Copyright");
                variant.setIprTypesLabel(types.isEmpty() ? null : String.join(", ", types));

                boolean anyGranted = Boolean.TRUE.equals(dto.getPatentGranted())
                                || Boolean.TRUE.equals(dto.getTrademarkGranted())
                                || Boolean.TRUE.equals(dto.getDesignGranted())
                                || Boolean.TRUE.equals(dto.getCopyrightGranted());
                boolean anyFiled = Boolean.TRUE.equals(dto.getPatentFiled())
                                || Boolean.TRUE.equals(dto.getTrademarkFiled())
                                || Boolean.TRUE.equals(dto.getDesignFiled())
                                || Boolean.TRUE.equals(dto.getCopyrightFiled());
                boolean trademarkOnly = Boolean.TRUE.equals(dto.getTrademarkFiled())
                                && !Boolean.TRUE.equals(dto.getPatentFiled())
                                && !Boolean.TRUE.equals(dto.getDesignFiled())
                                && !Boolean.TRUE.equals(dto.getCopyrightFiled());

                if (anyGranted) variant.setIprStatus(Item.IPRStatus.GRANTED);
                else if (trademarkOnly) variant.setIprStatus(Item.IPRStatus.TRADEMARK);
                else if (anyFiled) variant.setIprStatus(Item.IPRStatus.PATENT_FILED);
                else variant.setIprStatus(Item.IPRStatus.NOT_FILED);

                itemVariantRepository.save(variant);
        }

        private void saveProcurementDetails(
                        Item item,
                        List<ProcurementDetailDTO> details) {

                procurementDetailRepository.deleteAll(
                                procurementDetailRepository.findByItemId(item.getId()));

                if (details == null)
                        return;

                details.forEach(dto -> {

                        ProcurementDetail p = new ProcurementDetail();

                        p.setItem(item);
                        p.setProcurementAgency(dto.getProcurementAgency());
                        p.setTotFirmNo(dto.getTotFirmNo());
                        p.setNoOfItemProcured(dto.getNoOfItemProcured());
                        p.setProductionValue(dto.getProductionValue());
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
                ipr.setPatentInventor(dto.getPatentInventor());
                ipr.setPatentFilingNo(dto.getPatentFilingNo());
                ipr.setPatentFilingDate(dto.getPatentFilingDate());
                ipr.setPatentGrantNo(dto.getPatentGrantNo());
                ipr.setPatentGrantDate(dto.getPatentGrantDate());

                ipr.setTrademarkFiled(dto.getTrademarkFiled());
                ipr.setTrademarkGranted(dto.getTrademarkGranted());
                ipr.setTrademarkInventor(dto.getTrademarkInventor());
                ipr.setTrademarkFilingNo(dto.getTrademarkFilingNo());
                ipr.setTrademarkFilingDate(dto.getTrademarkFilingDate());
                ipr.setTrademarkGrantNo(dto.getTrademarkGrantNo());
                ipr.setTrademarkGrantDate(dto.getTrademarkGrantDate());

                ipr.setDesignFiled(dto.getDesignFiled());
                ipr.setDesignGranted(dto.getDesignGranted());
                ipr.setDesignInventor(dto.getDesignInventor());
                ipr.setDesignFilingNo(dto.getDesignFilingNo());
                ipr.setDesignFilingDate(dto.getDesignFilingDate());
                ipr.setDesignGrantNo(dto.getDesignGrantNo());
                ipr.setDesignGrantDate(dto.getDesignGrantDate());

                ipr.setCopyrightFiled(dto.getCopyrightFiled());
                ipr.setCopyrightGranted(dto.getCopyrightGranted());
                ipr.setCopyrightInventor(dto.getCopyrightInventor());
                ipr.setCopyrightFilingNo(dto.getCopyrightFilingNo());
                ipr.setCopyrightFilingDate(dto.getCopyrightFilingDate());
                ipr.setCopyrightGrantNo(dto.getCopyrightGrantNo());
                ipr.setCopyrightGrantDate(dto.getCopyrightGrantDate());

                iprDetailRepository.save(ipr);

                // Build a human-readable label of which IP types are filed/granted, e.g.
                // "Patent, Trademark, Copyright"
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
                if (Boolean.TRUE.equals(dto.getCopyrightFiled()) || Boolean.TRUE.equals(dto.getCopyrightGranted())) {
                        types.add("Copyright");
                }
                item.setIprTypesLabel(types.isEmpty() ? null : String.join(", ", types));

                // Derive item's overall IPR status from the detail flags (always overwrite)
                boolean anyGranted = Boolean.TRUE.equals(dto.getPatentGranted())
                                || Boolean.TRUE.equals(dto.getTrademarkGranted())
                                || Boolean.TRUE.equals(dto.getDesignGranted())
                                || Boolean.TRUE.equals(dto.getCopyrightGranted());
                boolean anyFiled = Boolean.TRUE.equals(dto.getPatentFiled())
                                || Boolean.TRUE.equals(dto.getTrademarkFiled())
                                || Boolean.TRUE.equals(dto.getDesignFiled())
                                || Boolean.TRUE.equals(dto.getCopyrightFiled());
                boolean trademarkOnly = Boolean.TRUE.equals(dto.getTrademarkFiled())
                                && !Boolean.TRUE.equals(dto.getPatentFiled())
                                && !Boolean.TRUE.equals(dto.getDesignFiled())
                                && !Boolean.TRUE.equals(dto.getCopyrightFiled());

                if (anyGranted) {
                        item.setIprStatus(Item.IPRStatus.GRANTED);
                } else if (trademarkOnly) {
                        item.setIprStatus(Item.IPRStatus.TRADEMARK);
                } else if (anyFiled) {
                        item.setIprStatus(Item.IPRStatus.PATENT_FILED);
                } else {
                        item.setIprStatus(Item.IPRStatus.NOT_FILED);
                }
                itemRepository.save(item);
        }

        /* ── DELETE ── */
        @Transactional
        @Caching(evict = {
                        @CacheEvict(value = "items", allEntries = true),
                        @CacheEvict(value = "item-detail", key = "#id"),
                        @CacheEvict(value = "dashboard", allEntries = true)
        })
        public void deleteItem(Long id) {
                Item item = findById(id);
                assertAccess(item);
                String name = item.getName();
                itemRepository.delete(item);
                // Intentionally no "item deleted" notification — only "item created" and
                // ToT validity notifications should be generated per requirements.
                log.info("Item deleted: {}", name);
        }

        /* ── UPLOAD IMAGE ── */
        @Transactional
        @CacheEvict(value = "item-detail", key = "#id")
        public ItemDTO.Response uploadImage(Long id, MultipartFile file) throws IOException {
                Item item = findById(id);
                assertAccess(item);

                String ext = getExtension(file.getOriginalFilename());
                String filename = UUID.randomUUID() + "." + ext;
                Path uploadPath = Paths.get(uploadDir);
                Files.createDirectories(uploadPath);
                Files.copy(file.getInputStream(), uploadPath.resolve(filename),
                                StandardCopyOption.REPLACE_EXISTING);

                item.setImageUrl("/uploads/" + filename);
                Item saved = itemRepository.save(item);
                // Intentionally no notification for image uploads.
                return toResponse(saved);
        }

        /* ── UPLOAD DOCUMENT ── */
        @Transactional
        @CacheEvict(value = "item-detail", key = "#id")
        public ItemDTO.Response uploadDocument(Long id, String docName, MultipartFile file) throws IOException {
                Item item = findById(id);
                assertAccess(item);

                String ext = getExtension(file.getOriginalFilename());
                String storedName = UUID.randomUUID() + "." + ext;
                Path uploadPath = Paths.get(uploadDir);
                Files.createDirectories(uploadPath);
                Files.copy(file.getInputStream(), uploadPath.resolve(storedName),
                                StandardCopyOption.REPLACE_EXISTING);

                ItemDocument doc = ItemDocument.builder()
                                .item(item)
                                .docName(docName != null && !docName.isBlank() ? docName : file.getOriginalFilename())
                                .storedFileName(storedName)
                                .originalFileName(file.getOriginalFilename())
                                .build();
                itemDocumentRepository.save(doc);

                // Intentionally no notification for document uploads.
                return toResponse(findById(id));
        }

        /* ── CONVERT ITEM TO VARIANTS ──
         * Turns an item that has no variants yet into one with a first variant,
         * moving (not duplicating) its existing scalar fields and child records
         * across. Nothing is lost — the item becomes a container and Variant 1
         * carries everything the item used to hold directly. */
        @Transactional
        @Caching(evict = {
                        @CacheEvict(value = "items", allEntries = true),
                        @CacheEvict(value = "item-detail", key = "#id"),
                        @CacheEvict(value = "dashboard", allEntries = true)
        })
        public ItemDTO.Response convertToVariant(Long id, ItemVariantDTO.ConvertRequest req) {
                Item item = findById(id);
                assertAccess(item);

                if (!itemVariantRepository.findByItemId(id).isEmpty()) {
                        throw new IllegalArgumentException("This item already has variants");
                }
                if (req.getName() == null || req.getName().isBlank()) {
                        throw new IllegalArgumentException("Variant name is required");
                }

                ItemVariant v = new ItemVariant();
                v.setItem(item);
                v.setName(req.getName().trim());
                v.setCode(req.getCode() != null ? req.getCode().trim() : null);

                // Copy every scalar field from the item onto the new Variant 1
                v.setCategory(item.getCategory());
                v.setDescription(item.getDescription());
                v.setInventor(item.getInventor());
                v.setProductDevCompletionDate(item.getProductDevCompletionDate());
                v.setImageUrl(item.getImageUrl());
                v.setDevelopmentStatus(item.getDevelopmentStatus());
                v.setDevelopmentDate(item.getDevelopmentDate());
                v.setRemarks(item.getRemarks());
                v.setTotStatus(item.getTotStatus());
                v.setTotDocumentNo(item.getTotDocumentNo());
                v.setFilledDate(item.getFilledDate());
                if (item.getTotDocumentsFiled() != null) v.getTotDocumentsFiled().addAll(item.getTotDocumentsFiled());
                v.setTrialsStatus(item.getTrialsStatus());
                v.setSampleRequestDate(item.getSampleRequestDate());
                v.setSampleSubmissionDate(item.getSampleSubmissionDate());
                v.setIprStatus(item.getIprStatus());
                v.setIprTypesLabel(item.getIprTypesLabel());
                if (item.getDocumentation() != null) v.getDocumentation().addAll(item.getDocumentation());
                v.setCrbfCount(item.getCrbfCount());
                v.setSsbCount(item.getSsbCount());
                v.setWeight(item.getWeight());
                v.setSize(item.getSize());
                v.setMaterial(item.getMaterial());
                v.setColor(item.getColor());
                v.setUnitCost(item.getUnitCost());
                v.setVendor(item.getVendor());
                v.setWarranty(item.getWarranty());

                ItemVariant saved = itemVariantRepository.save(v);

                // Re-parent (move, don't duplicate) every existing item-owned child
                // record onto the new variant.
                trialStakeholderRepository.findByItemId(id).forEach(t -> {
                        t.setItem(null);
                        t.setItemVariant(saved);
                        trialStakeholderRepository.save(t);
                });
                totPartnerRepository.findByItemId(id).forEach(t -> {
                        t.setItem(null);
                        t.setItemVariant(saved);
                        totPartnerRepository.save(t);
                });
                procurementDetailRepository.findByItemId(id).forEach(p -> {
                        p.setItem(null);
                        p.setItemVariant(saved);
                        procurementDetailRepository.save(p);
                });
                itemDocumentRepository.findByItemId(id).forEach(d -> {
                        d.setItem(null);
                        d.setItemVariant(saved);
                        itemDocumentRepository.save(d);
                });
                iprDetailRepository.findByItemId(id).ifPresent(ipr -> {
                        ipr.setItem(null);
                        ipr.setItemVariant(saved);
                        iprDetailRepository.save(ipr);
                });

                log.info("Item '{}' converted to variants — Variant 1 = '{}'", item.getName(), saved.getName());
                return toResponse(findById(id));
        }

        /* ── CREATE VARIANT (blank or copied from an existing variant) ──
         * Adds a new variant directly under the item. The item's own Basic
         * Info/ToT/IPR/Trial Stakeholders/Documentation/Procurement data is
         * left completely untouched — a variant is purely an addition, never
         * a forced conversion of the base item into "Variant 1". This is
         * intentional: earlier this required convertToVariant to run first,
         * which silently turned the item's own data into an auto-generated
         * "Variant 1" the user never asked for. That requirement is gone. */
        @Transactional
        @Caching(evict = {
                        @CacheEvict(value = "items", allEntries = true),
                        @CacheEvict(value = "item-detail", key = "#id"),
                        @CacheEvict(value = "dashboard", allEntries = true)
        })
        public ItemDTO.Response createVariant(Long id, ItemVariantDTO.CreateRequest req) {
                Item item = findById(id);
                assertAccess(item);

                if (req.getName() == null || req.getName().isBlank()) {
                        throw new IllegalArgumentException("Variant name is required");
                }

                ItemVariant v = new ItemVariant();
                v.setItem(item);
                v.setName(req.getName().trim());
                v.setCode(req.getCode() != null ? req.getCode().trim() : null);
                ItemVariant saved = itemVariantRepository.save(v);

                if ("copy".equalsIgnoreCase(req.getMode())) {
                        if (req.isCopyFromItem()) {
                                deepCopyItemDataToVariant(item, saved);
                        } else {
                                if (req.getCopyFromVariantId() == null) {
                                        throw new IllegalArgumentException("copyFromVariantId is required when mode is 'copy'");
                                }
                                ItemVariant source = itemVariantRepository.findById(req.getCopyFromVariantId())
                                                .orElseThrow(() -> new ResourceNotFoundException("Variant", "id", req.getCopyFromVariantId()));
                                if (source.getItem() == null || !source.getItem().getId().equals(id)) {
                                        throw new IllegalArgumentException("Source variant does not belong to this item");
                                }
                                deepCopyVariantData(source, saved);
                        }
                }
                // "blank" mode (the default): saved stays empty apart from name/code —
                // the user fills in every tab from scratch, completely independent of
                // every other variant.

                return toResponse(findById(id));
        }

        /* Deep-copies every scalar field and child record from `source` onto
         * `target` as brand-new, independent rows — nothing is shared, so later
         * edits to either variant never affect the other. */
        private void deepCopyVariantData(ItemVariant source, ItemVariant target) {
                target.setCategory(source.getCategory());
                target.setDescription(source.getDescription());
                target.setInventor(source.getInventor());
                target.setProductDevCompletionDate(source.getProductDevCompletionDate());
                target.setImageUrl(source.getImageUrl());
                target.setDevelopmentStatus(source.getDevelopmentStatus());
                target.setDevelopmentDate(source.getDevelopmentDate());
                target.setRemarks(source.getRemarks());
                target.setTotStatus(source.getTotStatus());
                target.setTotDocumentNo(source.getTotDocumentNo());
                target.setFilledDate(source.getFilledDate());
                target.getTotDocumentsFiled().clear();
                if (source.getTotDocumentsFiled() != null) target.getTotDocumentsFiled().addAll(source.getTotDocumentsFiled());
                target.setTrialsStatus(source.getTrialsStatus());
                target.setSampleRequestDate(source.getSampleRequestDate());
                target.setSampleSubmissionDate(source.getSampleSubmissionDate());
                target.setIprStatus(source.getIprStatus());
                target.setIprTypesLabel(source.getIprTypesLabel());
                target.getDocumentation().clear();
                if (source.getDocumentation() != null) target.getDocumentation().addAll(source.getDocumentation());
                target.setCrbfCount(source.getCrbfCount());
                target.setSsbCount(source.getSsbCount());
                target.setWeight(source.getWeight());
                target.setSize(source.getSize());
                target.setMaterial(source.getMaterial());
                target.setColor(source.getColor());
                target.setUnitCost(source.getUnitCost());
                target.setVendor(source.getVendor());
                target.setWarranty(source.getWarranty());
                itemVariantRepository.save(target);

                trialStakeholderRepository.findByItemVariantId(source.getId()).forEach(s -> {
                        TrialStakeholder t = new TrialStakeholder();
                        t.setItemVariant(target);
                        t.setStakeholderName(s.getStakeholderName());
                        t.setContactPersonName(s.getContactPersonName());
                        t.setStakeholderAddress(s.getStakeholderAddress());
                        t.setStakeholderPhone(s.getStakeholderPhone());
                        t.setSampleNo(s.getSampleNo());
                        t.setSampleRequestDate(s.getSampleRequestDate());
                        t.setSampleSubmissionDate(s.getSampleSubmissionDate());
                        t.setFeedback(s.getFeedback());
                        t.setCorrection(s.getCorrection());
                        t.setFurtherAction(s.getFurtherAction());
                        t.setStatus(s.getStatus());
                        trialStakeholderRepository.save(t);
                });

                totPartnerRepository.findByItemVariantId(source.getId()).forEach(s -> {
                        ToTPartner p = new ToTPartner();
                        p.setItemVariant(target);
                        p.setTotFirm(s.getTotFirm());
                        p.setLatotSigningDate(s.getLatotSigningDate());
                        p.setSampleSubmissionForTechAbsorptionDate(s.getSampleSubmissionForTechAbsorptionDate());
                        p.setTotCertificateDate(s.getTotCertificateDate());
                        p.setTotValidityDate(s.getTotValidityDate());
                        totPartnerRepository.save(p);
                });

                procurementDetailRepository.findByItemVariantId(source.getId()).forEach(s -> {
                        ProcurementDetail p = new ProcurementDetail();
                        p.setItemVariant(target);
                        p.setProcurementAgency(s.getProcurementAgency());
                        p.setTotFirmNo(s.getTotFirmNo());
                        p.setNoOfItemProcured(s.getNoOfItemProcured());
                        p.setProductionValue(s.getProductionValue());
                        p.setOrderNumber(s.getOrderNumber());
                        p.setOrderDate(s.getOrderDate());
                        procurementDetailRepository.save(p);
                });

                iprDetailRepository.findByItemVariantId(source.getId()).ifPresent(s -> {
                        IPRDetail i = new IPRDetail();
                        i.setItemVariant(target);
                        i.setPatentFiled(s.getPatentFiled());
                        i.setPatentGranted(s.getPatentGranted());
                        i.setPatentInventor(s.getPatentInventor());
                        i.setPatentFilingNo(s.getPatentFilingNo());
                        i.setPatentFilingDate(s.getPatentFilingDate());
                        i.setPatentGrantNo(s.getPatentGrantNo());
                        i.setPatentGrantDate(s.getPatentGrantDate());
                        i.setTrademarkFiled(s.getTrademarkFiled());
                        i.setTrademarkGranted(s.getTrademarkGranted());
                        i.setTrademarkInventor(s.getTrademarkInventor());
                        i.setTrademarkFilingNo(s.getTrademarkFilingNo());
                        i.setTrademarkFilingDate(s.getTrademarkFilingDate());
                        i.setTrademarkGrantNo(s.getTrademarkGrantNo());
                        i.setTrademarkGrantDate(s.getTrademarkGrantDate());
                        i.setDesignFiled(s.getDesignFiled());
                        i.setDesignGranted(s.getDesignGranted());
                        i.setDesignInventor(s.getDesignInventor());
                        i.setDesignFilingNo(s.getDesignFilingNo());
                        i.setDesignFilingDate(s.getDesignFilingDate());
                        i.setDesignGrantNo(s.getDesignGrantNo());
                        i.setDesignGrantDate(s.getDesignGrantDate());
                        i.setCopyrightFiled(s.getCopyrightFiled());
                        i.setCopyrightGranted(s.getCopyrightGranted());
                        i.setCopyrightInventor(s.getCopyrightInventor());
                        i.setCopyrightFilingNo(s.getCopyrightFilingNo());
                        i.setCopyrightFilingDate(s.getCopyrightFilingDate());
                        i.setCopyrightGrantNo(s.getCopyrightGrantNo());
                        i.setCopyrightGrantDate(s.getCopyrightGrantDate());
                        iprDetailRepository.save(i);
                });

                // NOTE: uploaded document files are intentionally not duplicated on
                // disk — a copied variant starts with no documents of its own and
                // the user re-uploads whichever ones apply to it.
        }

        /* Deep-copies every scalar field and child record from the base `Item`
         * itself onto `target` — used when the item has no other variants yet,
         * so the user can start their first variant from the item's own data
         * instead of a forced/implicit "base variant". Mirrors
         * deepCopyVariantData(ItemVariant, ItemVariant) field-for-field. */
        private void deepCopyItemDataToVariant(Item source, ItemVariant target) {
                target.setCategory(source.getCategory());
                target.setDescription(source.getDescription());
                target.setInventor(source.getInventor());
                target.setProductDevCompletionDate(source.getProductDevCompletionDate());
                target.setImageUrl(source.getImageUrl());
                target.setDevelopmentStatus(source.getDevelopmentStatus());
                target.setDevelopmentDate(source.getDevelopmentDate());
                target.setRemarks(source.getRemarks());
                target.setTotStatus(source.getTotStatus());
                target.setTotDocumentNo(source.getTotDocumentNo());
                target.setFilledDate(source.getFilledDate());
                target.getTotDocumentsFiled().clear();
                if (source.getTotDocumentsFiled() != null) target.getTotDocumentsFiled().addAll(source.getTotDocumentsFiled());
                target.setTrialsStatus(source.getTrialsStatus());
                target.setSampleRequestDate(source.getSampleRequestDate());
                target.setSampleSubmissionDate(source.getSampleSubmissionDate());
                target.setIprStatus(source.getIprStatus());
                target.setIprTypesLabel(source.getIprTypesLabel());
                target.getDocumentation().clear();
                if (source.getDocumentation() != null) target.getDocumentation().addAll(source.getDocumentation());
                target.setCrbfCount(source.getCrbfCount());
                target.setSsbCount(source.getSsbCount());
                target.setWeight(source.getWeight());
                target.setSize(source.getSize());
                target.setMaterial(source.getMaterial());
                target.setColor(source.getColor());
                target.setUnitCost(source.getUnitCost());
                target.setVendor(source.getVendor());
                target.setWarranty(source.getWarranty());
                itemVariantRepository.save(target);

                trialStakeholderRepository.findByItemId(source.getId()).forEach(s -> {
                        TrialStakeholder t = new TrialStakeholder();
                        t.setItemVariant(target);
                        t.setStakeholderName(s.getStakeholderName());
                        t.setContactPersonName(s.getContactPersonName());
                        t.setStakeholderAddress(s.getStakeholderAddress());
                        t.setStakeholderPhone(s.getStakeholderPhone());
                        t.setSampleNo(s.getSampleNo());
                        t.setSampleRequestDate(s.getSampleRequestDate());
                        t.setSampleSubmissionDate(s.getSampleSubmissionDate());
                        t.setFeedback(s.getFeedback());
                        t.setCorrection(s.getCorrection());
                        t.setFurtherAction(s.getFurtherAction());
                        t.setStatus(s.getStatus());
                        trialStakeholderRepository.save(t);
                });

                totPartnerRepository.findByItemId(source.getId()).forEach(s -> {
                        ToTPartner p = new ToTPartner();
                        p.setItemVariant(target);
                        p.setTotFirm(s.getTotFirm());
                        p.setLatotSigningDate(s.getLatotSigningDate());
                        p.setSampleSubmissionForTechAbsorptionDate(s.getSampleSubmissionForTechAbsorptionDate());
                        p.setTotCertificateDate(s.getTotCertificateDate());
                        p.setTotValidityDate(s.getTotValidityDate());
                        totPartnerRepository.save(p);
                });

                procurementDetailRepository.findByItemId(source.getId()).forEach(s -> {
                        ProcurementDetail p = new ProcurementDetail();
                        p.setItemVariant(target);
                        p.setProcurementAgency(s.getProcurementAgency());
                        p.setTotFirmNo(s.getTotFirmNo());
                        p.setNoOfItemProcured(s.getNoOfItemProcured());
                        p.setProductionValue(s.getProductionValue());
                        p.setOrderNumber(s.getOrderNumber());
                        p.setOrderDate(s.getOrderDate());
                        procurementDetailRepository.save(p);
                });

                iprDetailRepository.findByItemId(source.getId()).ifPresent(s -> {
                        IPRDetail i = new IPRDetail();
                        i.setItemVariant(target);
                        i.setPatentFiled(s.getPatentFiled());
                        i.setPatentGranted(s.getPatentGranted());
                        i.setPatentInventor(s.getPatentInventor());
                        i.setPatentFilingNo(s.getPatentFilingNo());
                        i.setPatentFilingDate(s.getPatentFilingDate());
                        i.setPatentGrantNo(s.getPatentGrantNo());
                        i.setPatentGrantDate(s.getPatentGrantDate());
                        i.setTrademarkFiled(s.getTrademarkFiled());
                        i.setTrademarkGranted(s.getTrademarkGranted());
                        i.setTrademarkInventor(s.getTrademarkInventor());
                        i.setTrademarkFilingNo(s.getTrademarkFilingNo());
                        i.setTrademarkFilingDate(s.getTrademarkFilingDate());
                        i.setTrademarkGrantNo(s.getTrademarkGrantNo());
                        i.setTrademarkGrantDate(s.getTrademarkGrantDate());
                        i.setDesignFiled(s.getDesignFiled());
                        i.setDesignGranted(s.getDesignGranted());
                        i.setDesignInventor(s.getDesignInventor());
                        i.setDesignFilingNo(s.getDesignFilingNo());
                        i.setDesignFilingDate(s.getDesignFilingDate());
                        i.setDesignGrantNo(s.getDesignGrantNo());
                        i.setDesignGrantDate(s.getDesignGrantDate());
                        i.setCopyrightFiled(s.getCopyrightFiled());
                        i.setCopyrightGranted(s.getCopyrightGranted());
                        i.setCopyrightInventor(s.getCopyrightInventor());
                        i.setCopyrightFilingNo(s.getCopyrightFilingNo());
                        i.setCopyrightFilingDate(s.getCopyrightFilingDate());
                        i.setCopyrightGrantNo(s.getCopyrightGrantNo());
                        i.setCopyrightGrantDate(s.getCopyrightGrantDate());
                        iprDetailRepository.save(i);
                });

                // NOTE: uploaded document files are intentionally not duplicated on
                // disk — a copied variant starts with no documents of its own and
                // the user re-uploads whichever ones apply to it.
        }

        /* ── GET VARIANT DETAIL (full independent data for one tab-set) ── */
        @Transactional(readOnly = true)
        public ItemVariantDTO getVariantDetail(Long id, Long variantId) {
                Item item = findById(id);
                assertAccess(item);
                ItemVariant v = findVariantOrThrow(item, variantId);
                return toVariantDTO(v, item);
        }

        /* ── UPDATE VARIANT (full independent data across every tab) ── */
        @Transactional
        @CacheEvict(value = "item-detail", key = "#id")
        public ItemDTO.Response updateVariant(Long id, Long variantId, ItemVariantDTO dto) {
                Item item = findById(id);
                assertAccess(item);

                ItemVariant v = findVariantOrThrow(item, variantId);

                if (dto.getName() != null && !dto.getName().isBlank())
                        v.setName(dto.getName().trim());
                if (dto.getCode() != null)
                        v.setCode(dto.getCode().trim());

                applyVariantScalarFields(v, dto);
                ItemVariant saved = itemVariantRepository.save(v);

                saveVariantTotPartners(saved, dto.getTotPartners());
                saveVariantTrialStakeholders(saved, dto.getTrialStakeholders());
                saveVariantProcurementDetails(saved, dto.getProcurementDetails());
                saveVariantIprDetail(saved, dto.getIprDetail());

                return toResponse(findById(id));
        }

        /* ── UPLOAD VARIANT IMAGE ──
         * Mirrors uploadImage(id, file) above but stores the file against the
         * variant's own imageUrl, so each variant can carry its own picture
         * independently of the parent item's — matching the base-item edit flow. */
        @Transactional
        @CacheEvict(value = "item-detail", key = "#id")
        public ItemDTO.Response uploadVariantImage(Long id, Long variantId, MultipartFile file) throws IOException {
                Item item = findById(id);
                assertAccess(item);
                ItemVariant v = findVariantOrThrow(item, variantId);

                String ext = getExtension(file.getOriginalFilename());
                String filename = UUID.randomUUID() + "." + ext;
                Path uploadPath = Paths.get(uploadDir);
                Files.createDirectories(uploadPath);
                Files.copy(file.getInputStream(), uploadPath.resolve(filename),
                                StandardCopyOption.REPLACE_EXISTING);

                v.setImageUrl("/uploads/" + filename);
                itemVariantRepository.save(v);

                return toResponse(findById(id));
        }

        /* ── DELETE VARIANT ── */
        @Transactional
        @CacheEvict(value = "item-detail", key = "#id")
        public ItemDTO.Response deleteVariant(Long id, Long variantId) {
                Item item = findById(id);
                assertAccess(item);

                ItemVariant v = findVariantOrThrow(item, variantId);
                // cascade = ALL + orphanRemoval on ItemVariant's own child collections
                // takes care of removing its ToT partners, trial stakeholders,
                // procurement details, documents and IPR record along with it.
                itemVariantRepository.delete(v);

                return toResponse(findById(id));
        }

        private ItemVariant findVariantOrThrow(Item item, Long variantId) {
                ItemVariant v = itemVariantRepository.findById(variantId)
                                .orElseThrow(() -> new ResourceNotFoundException("Variant", "id", variantId));
                if (v.getItem() == null || !v.getItem().getId().equals(item.getId())) {
                        throw new ResourceNotFoundException("Variant", "id", variantId);
                }
                return v;
        }

        /* ── DELETE DOCUMENT ── */
        @Transactional
        @CacheEvict(value = "item-detail", key = "#id")
        public ItemDTO.Response deleteDocument(Long id, Long docId) {
                Item item = findById(id);
                assertAccess(item);

                ItemDocument doc = itemDocumentRepository.findById(docId)
                                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", docId));

                if (doc.getItem() == null || !doc.getItem().getId().equals(id)) {
                        throw new ResourceNotFoundException("Document", "id", docId);
                }

                try {
                        if (doc.getStoredFileName() != null) {
                                Files.deleteIfExists(Paths.get(uploadDir).resolve(doc.getStoredFileName()));
                        }
                } catch (IOException e) {
                        log.warn("Could not delete stored file for document {}: {}", docId, e.getMessage());
                }

                itemDocumentRepository.delete(doc);
                return toResponse(findById(id));
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
                                .category(r.getCategory())
                                .description(r.getDescription())
                                .inventor(r.getInventor())
                                .productDevCompletionDate(r.getProductDevCompletionDate())
                                .developmentStatus(parseEnum(Item.DevelopmentStatus.class, r.getDevelopmentStatus()))
                                .developmentDate(r.getDevelopmentDate())
                                .remarks(r.getRemarks())
                                .totStatus(parseEnum(Item.ToTStatus.class, r.getTotStatus()))
                                .totDocumentNo(r.getTotDocumentNo())
                                .filledDate(r.getFilledDate())
                                .totDocumentsFiled(r.getTotDocumentsFiled() != null ? r.getTotDocumentsFiled()
                                                : new java.util.ArrayList<>())
                                .trialsStatus(parseEnum(Item.TrialsStatus.class, r.getTrialsStatus()))
                                .sampleRequestDate(r.getSampleRequestDate())
                                .sampleSubmissionDate(r.getSampleSubmissionDate())
                                .iprStatus(parseEnum(Item.IPRStatus.class, r.getIprStatus()))
                                .documentation(r.getDocumentation() != null ? r.getDocumentation()
                                                : new java.util.ArrayList<>())
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
                item.setCategory(r.getCategory());
                item.setDescription(r.getDescription());
                item.setInventor(r.getInventor());
                item.setProductDevCompletionDate(r.getProductDevCompletionDate());
                item.setDevelopmentStatus(parseEnum(Item.DevelopmentStatus.class, r.getDevelopmentStatus()));
                item.setDevelopmentDate(r.getDevelopmentDate());
                item.setRemarks(r.getRemarks());
                item.setTotStatus(parseEnum(Item.ToTStatus.class, r.getTotStatus()));
                item.setTotDocumentNo(r.getTotDocumentNo());
                item.setFilledDate(r.getFilledDate());
                item.getTotDocumentsFiled().clear();

                if (r.getTotDocumentsFiled() != null) {
                        item.getTotDocumentsFiled().addAll(
                                        r.getTotDocumentsFiled());
                }
                // Only overwrite trialsStatus if the caller explicitly provided one
                if (r.getTrialsStatus() != null && !r.getTrialsStatus().isBlank()) {
                        item.setTrialsStatus(parseEnum(Item.TrialsStatus.class, r.getTrialsStatus()));
                }
                item.setSampleRequestDate(r.getSampleRequestDate());
                item.setSampleSubmissionDate(r.getSampleSubmissionDate());
                item.setIprStatus(parseEnum(Item.IPRStatus.class, r.getIprStatus()));
                item.getDocumentation().clear();

                if (r.getDocumentation() != null) {
                        item.getDocumentation().addAll(
                                        r.getDocumentation());
                }
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

        /* Maps a variant to its DTO. A variant is meant to be fully independent
         * once created via convert/create-variant — but for legacy variants
         * saved before this DTO existed, an unset field/collection still falls
         * back to the parent item's own value so nothing regresses to blank. */
        private ItemVariantDTO toVariantDTO(ItemVariant v, Item item) {
                List<ToTPartnerDTO> totPartners = totPartnerRepository.findByItemVariantId(v.getId())
                                .stream()
                                .map(t -> ToTPartnerDTO.builder()
                                                .id(t.getId())
                                                .totFirm(t.getTotFirm())
                                                .latotSigningDate(t.getLatotSigningDate())
                                                .sampleSubmissionForTechAbsorptionDate(
                                                                t.getSampleSubmissionForTechAbsorptionDate())
                                                .totCertificateDate(t.getTotCertificateDate())
                                                .totValidityDate(t.getTotValidityDate())
                                                .build())
                                .toList();

                List<TrialStakeholderDTO> trialStakeholders = trialStakeholderRepository.findByItemVariantId(v.getId())
                                .stream()
                                .map(t -> TrialStakeholderDTO.builder()
                                                .id(t.getId())
                                                .stakeholderName(t.getStakeholderName())
                                                .contactPersonName(t.getContactPersonName())
                                                .stakeholderAddress(t.getStakeholderAddress())
                                                .stakeholderPhone(t.getStakeholderPhone())
                                                .sampleNo(t.getSampleNo())
                                                .sampleRequestDate(t.getSampleRequestDate())
                                                .sampleSubmissionDate(t.getSampleSubmissionDate())
                                                .feedback(t.getFeedback())
                                                .correction(t.getCorrection())
                                                .furtherAction(t.getFurtherAction())
                                                .status(formatTrialStakeholderStatus(t.getStatus()))
                                                .build())
                                .toList();

                List<ProcurementDetailDTO> procurementDetails = procurementDetailRepository.findByItemVariantId(v.getId())
                                .stream()
                                .map(p -> ProcurementDetailDTO.builder()
                                                .id(p.getId())
                                                .procurementAgency(p.getProcurementAgency())
                                                .totFirmNo(p.getTotFirmNo())
                                                .noOfItemProcured(p.getNoOfItemProcured())
                                                .productionValue(p.getProductionValue())
                                                .orderNumber(p.getOrderNumber())
                                                .orderDate(p.getOrderDate())
                                                .build())
                                .toList();

                List<ItemDocumentDTO> uploadedDocuments = itemDocumentRepository
                                .findByItemVariantIdOrderByUploadedAtDesc(v.getId())
                                .stream()
                                .map(d -> ItemDocumentDTO.builder()
                                                .id(d.getId())
                                                .docName(d.getDocName())
                                                .originalFileName(d.getOriginalFileName())
                                                .fileUrl(d.getStoredFileName() != null
                                                                ? "/uploads/" + d.getStoredFileName()
                                                                : null)
                                                .uploadedAt(d.getUploadedAt())
                                                .build())
                                .toList();

                IPRDetailDTO iprDetail = iprDetailRepository.findByItemVariantId(v.getId())
                                .map(this::toIprDetailDTO)
                                .orElse(null);

                return ItemVariantDTO.builder()
                                .id(v.getId())
                                .name(v.getName())
                                .code(v.getCode())
                                .category(v.getCategory() != null ? v.getCategory() : item.getCategory())
                                .description(v.getDescription())
                                .inventor(v.getInventor() != null ? v.getInventor() : item.getInventor())
                                .productDevCompletionDate(v.getProductDevCompletionDate() != null
                                                ? v.getProductDevCompletionDate() : item.getProductDevCompletionDate())
                                .imageUrl(v.getImageUrl() != null ? v.getImageUrl() : item.getImageUrl())
                                .developmentStatus(formatEnum(
                                                v.getDevelopmentStatus() != null ? v.getDevelopmentStatus() : item.getDevelopmentStatus()))
                                .developmentDate(v.getDevelopmentDate() != null
                                                ? v.getDevelopmentDate().toString()
                                                : (item.getDevelopmentDate() != null ? item.getDevelopmentDate().toString() : null))
                                .remarks(v.getRemarks())
                                .totStatus(formatEnum(v.getTotStatus() != null ? v.getTotStatus() : item.getTotStatus()))
                                .totDocumentNo(v.getTotDocumentNo())
                                .filledDate(v.getFilledDate())
                                .totDocumentsFiled(v.getTotDocumentsFiled() == null ? new ArrayList<>() : new ArrayList<>(v.getTotDocumentsFiled()))
                                .totPartners(totPartners)
                                .trialsStatus(formatEnum(v.getTrialsStatus() != null ? v.getTrialsStatus() : item.getTrialsStatus()))
                                .sampleRequestDate(v.getSampleRequestDate())
                                .sampleSubmissionDate(v.getSampleSubmissionDate())
                                .trialStakeholders(trialStakeholders)
                                .iprStatus(formatEnum(v.getIprStatus() != null ? v.getIprStatus() : item.getIprStatus()))
                                .iprStatusLabel(v.getIprTypesLabel())
                                .iprDetail(iprDetail)
                                .documentation(v.getDocumentation() == null ? new ArrayList<>() : new ArrayList<>(v.getDocumentation()))
                                .uploadedDocuments(uploadedDocuments)
                                .crbfCount(v.getCrbfCount())
                                .ssbCount(v.getSsbCount())
                                .procurementDetails(procurementDetails)
                                .weight(v.getWeight() != null ? v.getWeight() : item.getWeight())
                                .size(v.getSize() != null ? v.getSize() : item.getSize())
                                .material(v.getMaterial() != null ? v.getMaterial() : item.getMaterial())
                                .color(v.getColor() != null ? v.getColor() : item.getColor())
                                .unitCost(v.getUnitCost() != null ? v.getUnitCost() : item.getUnitCost())
                                .vendor(v.getVendor() != null ? v.getVendor() : item.getVendor())
                                .warranty(v.getWarranty() != null ? v.getWarranty() : item.getWarranty())
                                .build();
        }

        private IPRDetailDTO toIprDetailDTO(IPRDetail i) {
                return IPRDetailDTO.builder()
                                .patentFiled(i.getPatentFiled())
                                .patentGranted(i.getPatentGranted())
                                .patentInventor(i.getPatentInventor())
                                .patentFilingNo(i.getPatentFilingNo())
                                .patentFilingDate(i.getPatentFilingDate())
                                .patentGrantNo(i.getPatentGrantNo())
                                .patentGrantDate(i.getPatentGrantDate())
                                .trademarkFiled(i.getTrademarkFiled())
                                .trademarkGranted(i.getTrademarkGranted())
                                .trademarkInventor(i.getTrademarkInventor())
                                .trademarkFilingNo(i.getTrademarkFilingNo())
                                .trademarkFilingDate(i.getTrademarkFilingDate())
                                .trademarkGrantNo(i.getTrademarkGrantNo())
                                .trademarkGrantDate(i.getTrademarkGrantDate())
                                .designFiled(i.getDesignFiled())
                                .designGranted(i.getDesignGranted())
                                .designInventor(i.getDesignInventor())
                                .designFilingNo(i.getDesignFilingNo())
                                .designFilingDate(i.getDesignFilingDate())
                                .designGrantNo(i.getDesignGrantNo())
                                .designGrantDate(i.getDesignGrantDate())
                                .copyrightFiled(i.getCopyrightFiled())
                                .copyrightGranted(i.getCopyrightGranted())
                                .copyrightInventor(i.getCopyrightInventor())
                                .copyrightFilingNo(i.getCopyrightFilingNo())
                                .copyrightFilingDate(i.getCopyrightFilingDate())
                                .copyrightGrantNo(i.getCopyrightGrantNo())
                                .copyrightGrantDate(i.getCopyrightGrantDate())
                                .build();
        }

        private ItemDTO.Summary toSummary(Item item) {
                List<String> stakeholderNames = trialStakeholderRepository.findByItemId(item.getId())
                                .stream()
                                .map(TrialStakeholder::getStakeholderName)
                                .filter(n -> n != null && !n.isBlank())
                                .toList();

                List<ItemVariantDTO> variants = itemVariantRepository.findByItemId(item.getId())
                                .stream()
                                .map(v -> toVariantDTO(v, item))
                                .toList();

                return ItemDTO.Summary.builder()
                                .id(item.getId())
                                .name(item.getName())
                                .category(item.getCategory())
                                .description(item.getDescription())
                                .imageUrl(item.getImageUrl())
                                .inventor(item.getInventor())
                                .developmentStatus(formatEnum(item.getDevelopmentStatus()))
                                .totStatus(formatEnum(item.getTotStatus()))
                                .iprStatus(formatEnum(item.getIprStatus()))
                                .iprStatusLabel(item.getIprTypesLabel() != null
                                                ? item.getIprTypesLabel()
                                                : formatEnum(item.getIprStatus()))
                                .trialsStatus(formatEnum(item.getTrialsStatus()))
                                .trialStakeholderNames(stakeholderNames)
                                .variants(variants)
                                .hasVariants(!variants.isEmpty())
                                .updatedAt(item.getUpdatedAt())
                                .build();
        }

        private ItemDTO.Response toResponse(Item item) {

                List<ToTPartnerDTO> totPartners = totPartnerRepository.findByItemId(item.getId())
                                .stream()
                                .map(t -> ToTPartnerDTO.builder()
                                                .id(t.getId())
                                                .totFirm(t.getTotFirm())
                                                .latotSigningDate(t.getLatotSigningDate())
                                                .sampleSubmissionForTechAbsorptionDate(
                                                                t.getSampleSubmissionForTechAbsorptionDate())
                                                .totCertificateDate(t.getTotCertificateDate())
                                                .totValidityDate(t.getTotValidityDate())
                                                .build())
                                .toList();

                List<ProcurementDetailDTO> procurementDetails = procurementDetailRepository.findByItemId(item.getId())
                                .stream()
                                .map(p -> ProcurementDetailDTO.builder()
                                                .id(p.getId())
                                                .procurementAgency(p.getProcurementAgency())
                                                .totFirmNo(p.getTotFirmNo())
                                                .noOfItemProcured(p.getNoOfItemProcured())
                                                .productionValue(p.getProductionValue())
                                                .orderNumber(p.getOrderNumber())
                                                .orderDate(p.getOrderDate())
                                                .build())
                                .toList();

                IPRDetailDTO iprDetail = iprDetailRepository.findByItemId(item.getId())
                                .map(i -> IPRDetailDTO.builder()
                                                .patentFiled(i.getPatentFiled())
                                                .patentGranted(i.getPatentGranted())
                                                .patentInventor(i.getPatentInventor())
                                                .patentFilingNo(i.getPatentFilingNo())
                                                .patentFilingDate(i.getPatentFilingDate())
                                                .patentGrantNo(i.getPatentGrantNo())
                                                .patentGrantDate(i.getPatentGrantDate())
                                                .trademarkFiled(i.getTrademarkFiled())
                                                .trademarkGranted(i.getTrademarkGranted())
                                                .trademarkInventor(i.getTrademarkInventor())
                                                .trademarkFilingNo(i.getTrademarkFilingNo())
                                                .trademarkFilingDate(i.getTrademarkFilingDate())
                                                .trademarkGrantNo(i.getTrademarkGrantNo())
                                                .trademarkGrantDate(i.getTrademarkGrantDate())
                                                .designFiled(i.getDesignFiled())
                                                .designGranted(i.getDesignGranted())
                                                .designInventor(i.getDesignInventor())
                                                .designFilingNo(i.getDesignFilingNo())
                                                .designFilingDate(i.getDesignFilingDate())
                                                .designGrantNo(i.getDesignGrantNo())
                                                .designGrantDate(i.getDesignGrantDate())
                                                .copyrightFiled(i.getCopyrightFiled())
                                                .copyrightGranted(i.getCopyrightGranted())
                                                .copyrightInventor(i.getCopyrightInventor())
                                                .copyrightFilingNo(i.getCopyrightFilingNo())
                                                .copyrightFilingDate(i.getCopyrightFilingDate())
                                                .copyrightGrantNo(i.getCopyrightGrantNo())
                                                .copyrightGrantDate(i.getCopyrightGrantDate())
                                                .build())
                                .orElse(null);

                List<TrialStakeholderDTO> trialStakeholders = trialStakeholderRepository.findByItemId(item.getId())
                                .stream()
                                .map(t -> TrialStakeholderDTO.builder()
                                                .id(t.getId())
                                                .stakeholderName(t.getStakeholderName())
                                                .contactPersonName(t.getContactPersonName())
                                                .stakeholderAddress(t.getStakeholderAddress())
                                                .stakeholderPhone(t.getStakeholderPhone())
                                                .sampleNo(t.getSampleNo())
                                                .sampleRequestDate(t.getSampleRequestDate())
                                                .sampleSubmissionDate(t.getSampleSubmissionDate())
                                                .feedback(t.getFeedback())
                                                .correction(t.getCorrection())
                                                .furtherAction(t.getFurtherAction())
                                                .status(formatTrialStakeholderStatus(t.getStatus()))
                                                .build())
                                .toList();

                List<ItemVariantDTO> variants = itemVariantRepository.findByItemId(item.getId())
                                .stream()
                                .map(v -> toVariantDTO(v, item))
                                .toList();

                List<ItemDocumentDTO> uploadedDocuments = itemDocumentRepository
                                .findByItemIdOrderByUploadedAtDesc(item.getId())
                                .stream()
                                .map(d -> ItemDocumentDTO.builder()
                                                .id(d.getId())
                                                .docName(d.getDocName())
                                                .originalFileName(d.getOriginalFileName())
                                                .fileUrl(d.getStoredFileName() != null
                                                                ? "/uploads/" + d.getStoredFileName()
                                                                : null)
                                                .uploadedAt(d.getUploadedAt())
                                                .build())
                                .toList();

                return ItemDTO.Response.builder()
                                .id(item.getId())
                                .name(item.getName())
                                .category(item.getCategory())
                                .description(item.getDescription())
                                .inventor(item.getInventor())
                                .imageUrl(item.getImageUrl())
                                .productDevCompletionDate(item.getProductDevCompletionDate())
                                .developmentStatus(formatEnum(item.getDevelopmentStatus()))
                                .developmentDate(item.getDevelopmentDate())
                                .remarks(item.getRemarks())
                                .totStatus(formatEnum(item.getTotStatus()))
                                .totDocumentNo(item.getTotDocumentNo())
                                .filledDate(item.getFilledDate())
                                .totDocumentsFiled(
                                item.getTotDocumentsFiled() == null
                                        ? new ArrayList<>()
                                        : new ArrayList<>(item.getTotDocumentsFiled())
                                )
                                                                .trialsStatus(formatEnum(item.getTrialsStatus()))
                                .sampleRequestDate(item.getSampleRequestDate())
                                .sampleSubmissionDate(item.getSampleSubmissionDate())
                                .trialStakeholders(trialStakeholders)
                                .iprStatus(formatEnum(item.getIprStatus()))
                                .iprStatusLabel(item.getIprTypesLabel() != null
                                                ? item.getIprTypesLabel()
                                                : formatEnum(item.getIprStatus()))
                                .documentation(
                                item.getDocumentation() == null
                                        ? new ArrayList<>()
                                        : new ArrayList<>(item.getDocumentation())
                                )
                                .uploadedDocuments(uploadedDocuments)
                                .variants(variants)
                                .hasVariants(!variants.isEmpty())
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
                if (value == null || value.isBlank())
                        return null;
                // Try reverse-lookup from human-readable display strings first
                String mapped = switch (value.trim()) {
                        case "Developed" -> "DEVELOPED";
                        case "In Progress" -> "IN_PROGRESS";
                        case "Under Development" -> "UNDER_DEVELOPMENT";
                        case "Not Started" -> "NOT_STARTED";
                        case "Filed" -> "FILED";
                        case "To Be Filed" -> "TO_BE_FILED";
                        case "Patent Filed" -> "PATENT_FILED";
                        case "Granted" -> "GRANTED";
                        case "Trademark" -> "TRADEMARK";
                        case "Under Review" -> "UNDER_REVIEW";
                        case "Not Filed" -> "NOT_FILED";
                        case "Pending" -> "PENDING";
                        case "Completed" -> "COMPLETED";
                        case "On Hold" -> "ON_HOLD";
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

        private String formatTrialStakeholderStatus(Enum<?> e) {
                if (e == null)
                        return null;
                return switch (e.name()) {
                        case "NOT_STARTED" -> "Not Started";
                        case "IN_PROGRESS" -> "In Progress";
                        case "TESTING" -> "Testing";
                        case "COMPLETED" -> "Completed";
                        case "ON_HOLD" -> "Pending";
                        default -> e.name();
                };
        }

        private String formatEnum(Enum<?> e) {
                if (e == null)
                        return null;
                return switch (e.name()) {
                        case "DEVELOPED" -> "Developed";
                        case "IN_PROGRESS" -> "In Progress";
                        case "UNDER_DEVELOPMENT" -> "Under Development";
                        case "NOT_STARTED" -> "Not Started";
                        case "FILED" -> "Filed";
                        case "TO_BE_FILED" -> "To Be Filed";
                        case "PATENT_FILED" -> "Patent Filed";
                        case "GRANTED" -> "Granted";
                        case "TRADEMARK" -> "Trademark";
                        case "UNDER_REVIEW" -> "Under Review";
                        case "NOT_FILED" -> "Not Filed";
                        case "PENDING" -> "Pending";
                        case "TESTING" -> "Testing";
                        case "COMPLETED" -> "Completed";
                        case "ON_HOLD" -> "On Hold";
                        default -> e.name();
                };
        }

        private String nullIfBlank(String s) {
                return (s == null || s.isBlank()) ? null : s;
        }

        private String getExtension(String filename) {
                if (filename == null)
                        return "jpg";
                int dot = filename.lastIndexOf('.');
                return dot >= 0 ? filename.substring(dot + 1).toLowerCase() : "jpg";
        }
}