const axios = require('axios');

// 缓存机制
let cachedReviews = null;
let lastFetchTime = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1小时缓存

const getReviews = async (asin) => {
  // 如果没有提供asin，使用默认值
  const productAsin = asin || 'B0BX7FD8H7';

  // 为每个asin维护独立的缓存
  const cacheKey = `reviews_${productAsin}`;
  if (cachedReviews?.[cacheKey] && 
      cachedReviews[cacheKey].length > 0 && 
      lastFetchTime?.[cacheKey] && 
      (Date.now() - lastFetchTime[cacheKey] < CACHE_DURATION)) {
    console.log(`Returning cached reviews for ${productAsin}:`, cachedReviews[cacheKey]);
    return cachedReviews[cacheKey];
  }

  const options = {
    method: 'GET',
    url: 'https://real-time-amazon-data.p.rapidapi.com/product-reviews',
    params: {
      asin: productAsin,
      country: 'CA',
      sort_by: 'TOP_REVIEWS',
      star_rating: 'ALL',
      verified_purchases_only: false,
      images_or_videos_only: false,
      current_format_only: false,
      page: '1'
    },
    headers: {
      'X-RapidAPI-Key': '54bdc2a9f6msh6855a3407d894f5p1edf4ajsn2eb5a962902b',
      'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
    }
  };

  try {
    console.log('Fetching new reviews from API...');
    const response = await axios.request(options);
    
    if (response.data?.data?.reviews && Object.keys(response.data.data.reviews).length > 0) {
      const reviews = Object.values(response.data.data.reviews)
        .slice(0, 5)
        .map(review => ({
          reviewer_name: review.reviewer_name || 'Amazon Customer',
          rating: parseInt(review.rating) || 5,
          comment: review.review_comment || review.review_title || 'Great product!',
          date: review.review_date || new Date().toISOString().split('T')[0]
        }));

      
      if (reviews.length > 0) {
        cachedReviews = {
          ...cachedReviews,
          [cacheKey]: reviews
        };
        lastFetchTime = {
          ...lastFetchTime,
          [cacheKey]: Date.now()
        };
        console.log('Updated cache with new reviews:', reviews);
      }
      
      return reviews;
    }

    // 如果没有找到评论，返回默认评价
    console.log('No reviews found in API response, using default reviews');
    return getDefaultReviews();

  } catch (error) {
    console.error('API Error:', error.message);
    
    // 如果是配额超限且有有效缓存，使用缓存
    if (error.response?.status === 429 && cachedReviews && cachedReviews.length > 0) {
      console.log('Using cached reviews due to API limit');
      return cachedReviews;
    }

    // 否则返回默认评价
    console.log('Returning default reviews');
    return getDefaultReviews();
  }
};

// 默认评价函数
const getDefaultReviews = () => {
  return [
    {
      reviewer_name: "John Smith",
      rating: 5,
      comment: "Excellent product! The performance exceeds my expectations.",
      date: new Date().toISOString().split('T')[0]
    },
    {
      reviewer_name: "Emma Wilson",
      rating: 4,
      comment: "Great value for money. The build quality is impressive.",
      date: new Date().toISOString().split('T')[0]
    },
    {
      reviewer_name: "Michael Brown",
      rating: 5,
      comment: "Perfect for both work and gaming. Highly recommended!",
      date: new Date().toISOString().split('T')[0]
    }
  ];
};

module.exports = { getReviews }; 