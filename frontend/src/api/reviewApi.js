export const getProductReviews = async (productId) => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return []; // 如果出错返回空数组
    }
  }; 