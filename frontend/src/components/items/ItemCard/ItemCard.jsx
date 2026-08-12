import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VariantSelectModal from "../VariantSelectModal/VariantSelectModal";
import StatusBadge from "../StatusBadge/StatusBadge";
import { formatDate } from "../../../utils/formatDate";
import { getImageUrl } from "../../../utils/imageUrl";
import Icon from "../../common/Icon/Icon";
import AlertIcon from "../../common/AlertIcon/AlertIcon";
import "./ItemCard.css";

export default function ItemCard({ item }) {
  const navigate = useNavigate();
  const [showVariants, setShowVariants] = useState(false);
  const hasVariants = item.variants && item.variants.length > 0;

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
      <div className="item-card" onClick={handleOpen}>
        <div className="item-card__image">
          {item.imageUrl ? (
            <img
              src={getImageUrl(item.imageUrl)}
              alt={item.name}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div className="item-card__image-placeholder"><Icon name="box" size={40} strokeWidth={1.2} style={{ opacity: 0.25 }} /></div>
          )}
        </div>

        <div className="item-card__body">
          <div className="item-card__title-row">
            <h3 className="item-card__name">
              <span className="item-card__name-text">{item.name}</span>
              {item.hasOverdueFeedback && (
                <AlertIcon message="A trial sample was submitted but feedback hasn't been received in time." />
              )}
              {item.hasOverdueTot && (
                <AlertIcon message={item.totOverdueMessage || "ToT validity has expired and renewal is pending."} />
              )}
            </h3>
            <StatusBadge status={item.developmentStatus} />
          </div>
          <div className="item-card__tags">
            {item.category && <span className="item-card__category">{item.category}</span>}
            {hasVariants && (
              <span className="item-card__variant-pill">
                {item.variants.length} variant{item.variants.length !== 1 ? "s" : ""}
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
