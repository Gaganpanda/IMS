import { useNavigate } from "react-router-dom";
import StatusBadge from "../StatusBadge/StatusBadge";
import { formatDate } from "../../../utils/formatDate";
import { getImageUrl } from "../../../utils/imageUrl";
import "./ItemCard.css";

export default function ItemCard({ item }) {
  const navigate = useNavigate();

  return (
    <div className="item-card" onClick={() => navigate(`/items/${item.id}`)}>
      {/* Image */}
      <div className="item-card__image">
        {item.imageUrl ? (
          <img
            src={getImageUrl(item.imageUrl)}
            alt={item.name}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <span className="item-card__image-placeholder"></span>
        )}

        <div className="item-card__badge-wrap">
          <StatusBadge status={item.developmentStatus} size="sm" />
        </div>
      </div>

      {/* Body */}
      <div className="item-card__body">
        <div className="item-card__meta">
          <span className="item-card__code">{item.code}</span>
          <span className="item-card__category">
            <span className="item-card__category-dot" />
            {item.category}
          </span>
        </div>

        <h3 className="item-card__name">{item.name}</h3>
        <p className="item-card__desc">{item.description}</p>

        {/* Status row */}
        <div className="item-card__statuses">
          <div className="item-card__status-item">
            <span className="item-card__status-label">ToT</span>
            <StatusBadge status={item.totStatus} size="sm" />
          </div>
          <div className="item-card__status-item">
            <span className="item-card__status-label">IPR</span>
            <StatusBadge status={item.iprStatus} size="sm" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="item-card__footer">
        <span className="item-card__updated">Updated {formatDate(item.updatedAt)}</span>
        <span className="item-card__arrow">→</span>
      </div>
    </div>
  );
}
