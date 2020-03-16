interface StampedPageDataSummary {
  unread: number;
  published: number;
  unpublished: number;
  archived: number;
  flagged: number;
  spam: number;
}

interface StampedPageData {
  total: number;
  page: number;
  totalPages: number;
  summary: StampedPageDataSummary;
}

export interface StampedState {
  productsRating: StampedProductRating[],
  currentProductReviews: any[],
  currentProductReviewsPageData: StampedPageData
}

export interface StampedProductRating {
  productId: string,
  rating: number,
  count: number,
  countQuestions: number
}