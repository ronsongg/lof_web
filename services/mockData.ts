/**
 * 模拟数据 - 用于开发和测试
 * 当无法访问集思录API时使用
 */

import { JisiluResponse } from './api';

export const MOCK_LOF_DATA: JisiluResponse = {
  page: 1,
  total: 15,
  rows: [
    {
      cell: {
        fund_id: '161121',
        fund_nm: '易方达纳斯达克100指数(QDII-LOF)',
        price: '1.284',
        increase_rt: '2.14',
        estimate_value: '1.250',
        discount_rt: '2.72',
        volume: '158420',
        amount: '2035847',
        fund_company: '易方达',
        index_nm: '纳斯达克100',
        stock_cd: 'SZ161121',
        nav_dt: '2024-02-02',
        last_time: '15:00:00'
      }
    },
    {
      cell: {
        fund_id: '162411',
        fund_nm: '华宝油气(QDII-LOF)',
        price: '0.542',
        increase_rt: '-0.37',
        estimate_value: '0.570',
        discount_rt: '-4.91',
        volume: '892341',
        amount: '483760',
        fund_company: '华宝基金',
        index_nm: '标普石油天然气上游股票指数',
        stock_cd: 'SZ162411',
        nav_dt: '2024-02-02',
        last_time: '15:00:00'
      }
    },
    {
      cell: {
        fund_id: '501018',
        fund_nm: '南方原油(LOF)',
        price: '1.105',
        increase_rt: '1.28',
        estimate_value: '1.100',
        discount_rt: '0.45',
        volume: '654231',
        amount: '722765',
        fund_company: '南方基金',
        index_nm: 'WTI原油价格收益率',
        stock_cd: 'SH501018',
        nav_dt: '2024-02-02',
        last_time: '15:00:00'
      }
    },
    {
      cell: {
        fund_id: '161129',
        fund_nm: '易方达原油A类(QDII-LOF)',
        price: '1.450',
        increase_rt: '1.05',
        estimate_value: '1.420',
        discount_rt: '2.11',
        volume: '234567',
        amount: '340122',
        fund_company: '易方达',
        index_nm: '原油价格收益率',
        stock_cd: 'SZ161129',
        nav_dt: '2024-02-02',
        last_time: '15:00:00'
      }
    },
    {
      cell: {
        fund_id: '160416',
        fund_nm: '石油基金(LOF)',
        price: '0.918',
        increase_rt: '-0.65',
        estimate_value: '0.950',
        discount_rt: '-3.37',
        volume: '445612',
        amount: '409072',
        fund_company: '华安基金',
        index_nm: '石油价格走势',
        stock_cd: 'SZ160416',
        nav_dt: '2024-02-02',
        last_time: '15:00:00'
      }
    },
    {
      cell: {
        fund_id: '161217',
        fund_nm: '国投瑞银白银LOF',
        price: '0.856',
        increase_rt: '0.47',
        estimate_value: '0.852',
        discount_rt: '0.47',
        volume: '123456',
        amount: '105678',
        fund_company: '国投瑞银',
        index_nm: '白银价格',
        stock_cd: 'SZ161217',
        nav_dt: '2024-02-02',
        last_time: '15:00:00'
      }
    },
    {
      cell: {
        fund_id: '518880',
        fund_nm: '黄金ETF',
        price: '4.102',
        increase_rt: '0.22',
        estimate_value: '4.150',
        discount_rt: '-1.16',
        volume: '987654',
        amount: '4051287',
        fund_company: '华安基金',
        index_nm: '上海黄金9999',
        stock_cd: 'SH518880',
        nav_dt: '2024-02-02',
        last_time: '15:00:00'
      }
    },
    {
      cell: {
        fund_id: '159934',
        fund_nm: '黄金ETF联接',
        price: '1.234',
        increase_rt: '0.16',
        estimate_value: '1.225',
        discount_rt: '0.73',
        volume: '567890',
        amount: '700831',
        fund_company: '易方达',
        index_nm: '黄金价格',
        stock_cd: 'SZ159934',
        nav_dt: '2024-02-02',
        last_time: '15:00:00'
      }
    }
  ]
};

// 模拟网络延迟
export const mockFetchWithDelay = async <T>(data: T, delay: number = 800): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};
