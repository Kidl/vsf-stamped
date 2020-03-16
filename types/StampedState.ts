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
  currentProductReviews: any[],
  currentProductReviewsPageData: StampedPageData
}
