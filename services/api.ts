/**
 * 集思录 API 服务
 * 处理 LOF 数据的获取和转换
 */

// 是否使用模拟数据（开发时可以启用）
const USE_MOCK_DATA = false; // 改为 true 使用模拟数据

// 集思录 API 响应类型
export interface JisiluLofItem {
  cell: {
    fund_id: string;           // 基金代码
    fund_nm: string;           // 基金名称
    price: string;             // 现价
    increase_rt: string;       // 涨跌幅
    estimate_value: string;    // IOPV/净值估算
    discount_rt: string;       // 溢价率
    volume: string;            // 成交量
    amount: string;            // 成交额
    fund_company: string;      // 基金公司
    index_nm: string;          // 跟踪指数
    stock_cd: string;          // 交易所代码
    nav_dt: string;            // 净值日期
    last_time: string;         // 更新时间
    maturity_dt?: string;      // 到期时间
  };
}

export interface JisiluResponse {
  page: number;
  rows: JisiluLofItem[];
  total: number;
}

// API 配置
const API_BASE_URL = import.meta.env.DEV ? '/api/jisilu' : 'https://www.jisilu.cn';
const LOF_INDEX_LIST_URL = `${API_BASE_URL}/data/lof/index_list/`;
const LOF_STOCK_LIST_URL = `${API_BASE_URL}/data/lof/stock_lof_list/`;

// 添加时间戳防止缓存
const addTimestamp = (url: string): string => {
  const timestamp = Date.now();
  return `${url}?___t=${timestamp}`;
};

/**
 * 获取指数型 LOF 列表
 */
export const fetchIndexLofList = async (useCache: boolean = true): Promise<JisiluResponse> => {
  try {
    // 如果启用模拟数据
    if (USE_MOCK_DATA) {
      const { MOCK_LOF_DATA, mockFetchWithDelay } = await import('./mockData');
      console.log('Using mock data');
      return await mockFetchWithDelay(MOCK_LOF_DATA);
    }

    // 尝试从缓存获取
    if (useCache) {
      const { getCache, setCache, CACHE_KEYS } = await import('../utils/cache');
      const cached = getCache<JisiluResponse>(CACHE_KEYS.LOF_INDEX_LIST);
      if (cached) {
        console.log('Using cached index LOF list');
        return cached;
      }
    }

    const response = await fetch(addTimestamp(LOF_INDEX_LIST_URL), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 保存到缓存（5分钟过期）
    if (useCache) {
      const { setCache, CACHE_KEYS } = await import('../utils/cache');
      setCache(CACHE_KEYS.LOF_INDEX_LIST, data, 5 * 60 * 1000);
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch index LOF list:', error);

    // 如果请求失败，尝试使用模拟数据作为后备
    console.warn('Falling back to mock data due to API error');
    const { MOCK_LOF_DATA, mockFetchWithDelay } = await import('./mockData');
    return await mockFetchWithDelay(MOCK_LOF_DATA);
  }
};

/**
 * 获取股票型 LOF 列表
 */
export const fetchStockLofList = async (useCache: boolean = true): Promise<JisiluResponse> => {
  try {
    // 尝试从缓存获取
    if (useCache) {
      const { getCache, setCache, CACHE_KEYS } = await import('../utils/cache');
      const cached = getCache<JisiluResponse>(CACHE_KEYS.LOF_STOCK_LIST);
      if (cached) {
        console.log('Using cached stock LOF list');
        return cached;
      }
    }

    const response = await fetch(addTimestamp(LOF_STOCK_LIST_URL), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 保存到缓存（5分钟过期）
    if (useCache) {
      const { setCache, CACHE_KEYS } = await import('../utils/cache');
      setCache(CACHE_KEYS.LOF_STOCK_LIST, data, 5 * 60 * 1000);
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch stock LOF list:', error);
    throw error;
  }
};

/**
 * 获取所有 LOF 数据（指数型 + 股票型）
 */
export const fetchAllLofList = async (useCache: boolean = true): Promise<JisiluResponse> => {
  try {
    // 尝试从缓存获取
    if (useCache) {
      const { getCache, setCache, CACHE_KEYS } = await import('../utils/cache');
      const cached = getCache<JisiluResponse>(CACHE_KEYS.LOF_ALL_LIST);
      if (cached) {
        console.log('Using cached all LOF list');
        return cached;
      }
    }

    const [indexData, stockData] = await Promise.all([
      fetchIndexLofList(useCache),
      fetchStockLofList(useCache)
    ]);

    const allData = {
      page: 1,
      rows: [...indexData.rows, ...stockData.rows],
      total: indexData.total + stockData.total
    };

    // 保存到缓存（5分钟过期）
    if (useCache) {
      const { setCache, CACHE_KEYS } = await import('../utils/cache');
      setCache(CACHE_KEYS.LOF_ALL_LIST, allData, 5 * 60 * 1000);
    }

    return allData;
  } catch (error) {
    console.error('Failed to fetch all LOF list:', error);
    // 如果一个失败，尝试返回另一个
    try {
      return await fetchIndexLofList(useCache);
    } catch {
      throw error;
    }
  }
};

/**
 * 根据基金代码查询基金信息
 */
export const fetchLofByCode = async (code: string): Promise<JisiluLofItem | null> => {
  try {
    // 先尝试从缓存中获取所有数据
    const allData = await fetchAllLofList(true);

    // 在所有数据中查找匹配的基金代码
    const found = allData.rows.find(item => item.cell.fund_id === code);

    if (found) {
      console.log('Found LOF by code:', code, found);
      return found;
    }

    console.warn('LOF not found by code:', code);
    return null;
  } catch (error) {
    console.error('Failed to fetch LOF by code:', error);
    throw error;
  }
};
