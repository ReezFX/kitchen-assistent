const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // 1 Stunde TTL

class CacheService {
  getFromCache(key) {
    return cache.get(key);
  }
  
  setToCache(key, data) {
    return cache.set(key, data);
  }
  
  invalidateCache(keyPattern) {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(keyPattern));
    matchingKeys.forEach(key => cache.del(key));
  }
  
  // Cache-Wrapper für AI-Anfragen
  async cachedAIRequest(requestKey, requestFn) {
    const cachedResult = this.getFromCache(requestKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    const result = await requestFn();
    this.setToCache(requestKey, result);
    return result;
  }
}

module.exports = CacheService; 