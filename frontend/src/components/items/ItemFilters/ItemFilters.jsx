    import { useDispatch, useSelector } from "react-redux";
    import { setFilters, resetFilters } from "../../../redux/slices/itemSlice";
    import SearchBar from "../../common/SearchBar/SearchBar";
    import Icon from "../../common/Icon/Icon";
    import {
      CATEGORIES,
      DEVELOPMENT_STATUS,
      TOT_STATUS,
      IPR_STATUS,
      TRIAL_STATUS,
    } from "../../../utils/constants";
    import "./ItemFilters.css";

    export default function ItemFilters() {
      const dispatch = useDispatch();
      const filters = useSelector((s) => s.items.filters);

      const handleChange = (key, val) => dispatch(setFilters({ [key]: val }));
      const handleReset  = () => dispatch(resetFilters());

      const hasActive =
        filters.search || filters.category || filters.developmentStatus ||
        filters.totStatus || filters.iprStatus || filters.trialsStatus;

      return (
        <div className="item-filters">
          {/* Single toolbar row: search + dropdowns + filter icon */}
          <div className="item-filters__row">
            <SearchBar
              value={filters.search}
              onChange={(val) => handleChange("search", val)}
              placeholder="Search items by name, category..."
              className="item-filters__search"
            />
            {/* Category */}
            <select
              className="item-filters__select"
              value={filters.category}
              onChange={(e) => handleChange("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Development Status */}
            <select
              className="item-filters__select"
              value={filters.developmentStatus}
              onChange={(e) => handleChange("developmentStatus", e.target.value)}
            >
              <option value="">All Development Status</option>
              {Object.values(DEVELOPMENT_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* ToT Status */}
            <select
              className="item-filters__select"
              value={filters.totStatus}
              onChange={(e) => handleChange("totStatus", e.target.value)}
            >
              <option value="">All ToT Status</option>
              {Object.values(TOT_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* IPR Status */}
            <select
              className="item-filters__select"
              value={filters.iprStatus}
              onChange={(e) => handleChange("iprStatus", e.target.value)}
            >
              <option value="">All IPR Status</option>
              {Object.values(IPR_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Trials Status */}
            <select
              className="item-filters__select"
              value={filters.trialsStatus}
              onChange={(e) => handleChange("trialsStatus", e.target.value)}
            >
              <option value="">All Trials Status</option>
              {Object.values(TRIAL_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Reset */}
            {hasActive && (
              <button className="item-filters__reset" onClick={handleReset}>
                Reset
              </button>
            )}

            {/* Filter icon label */}
            <button className="item-filters__filter-btn" disabled>
              <Icon name="filter" size={16} />
              Filter
            </button>
          </div>
        </div>
      );
    }
