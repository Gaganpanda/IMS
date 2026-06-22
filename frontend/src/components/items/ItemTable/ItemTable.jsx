    import { useNavigate } from "react-router-dom";
    import StatusBadge from "../StatusBadge/StatusBadge";
    import { formatDate, timeAgo } from "../../../utils/formatDate";
    import { getImageUrl } from "../../../utils/imageUrl";
    import "./ItemTable.css";

    const COLUMNS = [
      { key: "#",                 label: "#" },
      { key: "itemDetails",       label: "Item Details" },
      { key: "category",          label: "Category" },
      { key: "developmentStatus", label: "Development Status" },
      { key: "totStatus",         label: "ToT Status" },
      { key: "iprStatus",         label: "IPR Status" },
      { key: "trialsStatus",      label: "Trials Status" },
      { key: "updatedAt",         label: "Updated On" },
    ];

    export default function ItemTable({ items = [], loading }) {
      const navigate = useNavigate();

      if (loading) {
        return (
          <div className="item-table__skeleton">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="item-table__skeleton-row">
                <div className="skeleton skeleton--sm" />
                <div className="skeleton skeleton--lg" />
                <div className="skeleton skeleton--md" />
                <div className="skeleton skeleton--md" />
                <div className="skeleton skeleton--md" />
                <div className="skeleton skeleton--md" />
                <div className="skeleton skeleton--md" />
                <div className="skeleton skeleton--md" />
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="item-table__wrap">
          <table className="item-table">
            <thead className="item-table__head">
              <tr>
                {COLUMNS.map((col) => (
                  <th key={col.key} className="item-table__th">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.id}
                  className="item-table__row"
                  onClick={() => navigate(`/items/${item.id}`)}
                >
                  {/* # */}
                  <td className="item-table__td item-table__td--num">{idx + 1}</td>

                  {/* Item Details */}
                  <td className="item-table__td">
                    <div className="item-table__item-cell">
                      <div className="item-table__thumb">
                        {item.imageUrl ? (
                          <img
                            src={getImageUrl(item.imageUrl)}
                            alt={item.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.replaceWith(
                                Object.assign(document.createElement("span"), {
                                  className: "item-table__thumb-placeholder",
                                  textContent: "📦",
                                })
                              );
                            }}
                          />
                        ) : (
                          <span className="item-table__thumb-placeholder">📦</span>
                        )}
                      </div>
                      <div>
                        <div className="item-table__name">{item.name}</div>
                        <div className="item-table__code">{item.code}</div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="item-table__td">
                    <div className="item-table__category">
                      <span className="item-table__category-dot" />
                      {item.category}
                    </div>
                  </td>

                  {/* Statuses */}
                  <td className="item-table__td">
                    <StatusBadge status={item.developmentStatus} size="sm" />
                  </td>
                  <td className="item-table__td">
                    <StatusBadge status={item.totStatus} size="sm" />
                  </td>
                  <td className="item-table__td">
                    <StatusBadge status={item.iprStatus} size="sm" />
                  </td>
                  <td className="item-table__td">
                    <StatusBadge status={item.trialsStatus} size="sm" />
                  </td>

                  {/* Updated on */}
                  <td className="item-table__td">
                    <div className="item-table__date">{formatDate(item.updatedAt)}</div>
                    <div className="item-table__ago">{timeAgo(item.updatedAt)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
