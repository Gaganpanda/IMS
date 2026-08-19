import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VariantSelectModal from "../VariantSelectModal/VariantSelectModal";
import StatusBadge from "../StatusBadge/StatusBadge";
import { formatDate } from "../../../utils/formatDate";
import { getImageUrl } from "../../../utils/imageUrl";
import Icon from "../../common/Icon/Icon";
import AlertIcon from "../../common/AlertIcon/AlertIcon";
import { STATUS_BADGE_MAP } from "../../../utils/constants";
import "./ItemCard.css";

export default function ItemCard({ item }) {
  const navigate = useNavigate();
  const [showVariants, setShowVariants] = useState(false);
  const [imgError, setImgError] = useState(false);
  const hasVariants = item.variants && item.variants.length > 0;
  const statusVariant = STATUS_BADGE_MAP[item.developmentStatus] || "neutral";
  const hasAlert = Boolean(item.hasOverdueFeedback || item.hasOverdueTot);

  const handleOpen = () => {
    if (hasVariants) {
      setShowVariants(true);
    } else {
      navigate(`/items/${item.id}`);
    }
  };

  const handleSelectVariant = (variant) => {
    setShowVariants(false);
    navigate(`/items/${item.id}?variant=${variant.id}`);
  };

  return (
    <>
      <div
        className={`item-card${hasAlert ? " item-card--alert" : ""}`}
        data-status={statusVariant}
        onClick={handleOpen}
      >
        <div className="item-card__image">
          {item.imageUrl && !imgError ? (
            <img
              src={getImageUrl(item.imageUrl)}
              alt={item.name}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="item-card__image-placeholder"><Icon name="box" size={38} strokeWidth={1.2} /></div>
          )}
          {item.category && <span className="item-card__category-chip">{item.category}</span>}
        </div>

        <div className="item-card__body">
          <div className="item-card__title-row">
            <h3 className="item-card__name" title={item.name}>
              <span className="item-card__name-text">{item.name}</span>
            </h3>
            <StatusBadge status={item.developmentStatus} />
          </div>

          <div className="item-card__meta-row">
            {(item.hasOverdueFeedback || item.hasOverdueTot) && (
              <div className="item-card__alerts">
                {item.hasOverdueFeedback && (
                  <AlertIcon message="A trial sample was submitted but feedback hasn't been received in time." />
                )}
                {item.hasOverdueTot && (
                  <AlertIcon message={item.totOverdueMessage || "ToT validity has expired and renewal is pending."} />
                )}
              </div>
            )}
          </div>

          <div className="item-card__tags">
            {hasVariants ? (
              <span className="item-card__variant-pill">
                <Icon name="layers" size={12} strokeWidth={2} />
                {item.variants.length} variant{item.variants.length !== 1 ? "s" : ""}
              </span>
            ) : (
              <span className="item-card__variant-pill item-card__variant-pill--muted">
                Single SKU
              </span>
            )}
          </div>
        </div>

        <div className="item-card__footer">
          <span className="item-card__updated">
            <span className="item-card__updated-icon"><Icon name="calendar" size={14} strokeWidth={1.8} /></span>
            Updated on {formatDate(item.updatedAt)}
          </span>
          <button type="button" className="item-card__arrow-btn" aria-label="Open item" onClick={(e) => { e.stopPropagation(); handleOpen(); }}>
            <Icon name="forward" size={16} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      <VariantSelectModal
        item={item}
        open={showVariants}
        onClose={() => setShowVariants(false)}
        onSelectVariant={handleSelectVariant}
      />
    </>
  );
}
