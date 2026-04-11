const allowedOperators = ['gte', 'gt', 'lte', 'lt'];

class APIFeatures {
  constructor(query, queryString, options = {}) {
    this.query = query;
    this.queryString = queryString;
    this.allowedSortFields = options.allowedSortFields || [];
    this.allowedSelectFields = options.allowedSelectFields || [];
    this.maxLimit = options.maxLimit || 10;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    Object.entries(queryObj).forEach(([field, value]) => {
      if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([operator, operatorValue]) => {
          if (!allowedOperators.includes(operator)) return;

          this.query = this.query.where(field)[operator](operatorValue);
        });
      } else {
        this.query = this.query.where(field).equals(value);
      }
    });

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort
        .split(',')
        .map((field) => this.normalizeSortField(field))
        .filter(Boolean)
        .join(' ');

      this.query = this.query.sort(sortBy || '-createdAt');
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields
        .split(',')
        .map((field) => this.normalizeSelectField(field))
        .filter(Boolean)
        .join(' ');

      this.query = this.query.select(fields || '-__v');
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const { limit, skip } = this.getPaginationOptions();
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  getPaginationOptions() {
    const page = this.queryString.page * 1 || 1;
    const requestedLimit = this.queryString.limit * 1 || this.maxLimit;
    const limit = Math.min(requestedLimit, this.maxLimit);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  getFilterQuery() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    const filter = {};

    Object.entries(queryObj).forEach(([field, value]) => {
      if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([operator, operatorValue]) => {
          if (!allowedOperators.includes(operator)) return;

          filter[field] = {
            ...(filter[field] || {}),
            [`$${operator}`]: operatorValue,
          };
        });
      } else {
        filter[field] = value;
      }
    });

    return filter;
  }

  normalizeSortField(field) {
    const direction = field.startsWith('-') ? '-' : '';
    const fieldName = field.replace(/^-/, '');

    if (!this.allowedSortFields.includes(fieldName)) return null;

    return `${direction}${fieldName === 'ratings' ? 'ratingsAverage' : fieldName}`;
  }

  normalizeSelectField(field) {
    if (!this.allowedSelectFields.includes(field)) return null;

    return field === 'images' ? '+images' : field;
  }
}

module.exports = APIFeatures;
