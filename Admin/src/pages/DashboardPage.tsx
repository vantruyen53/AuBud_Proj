import React, { useMemo, useState , useEffect} from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,CartesianGrid,
  BarChart, Bar
} from 'recharts';
import {HiOutlineUserGroup, HiOutlineLightningBolt, HiOutlineUserAdd,} from 'react-icons/hi';
import { TiArrowSortedUp, TiArrowSortedDown } from "react-icons/ti";
import '../assets/styles/dashboard.css';

//Modal
import LoadingModal from '../components/modal/LoadingModal';
import MonthModal from '../components/modal/MonthModal';

//Utils
import formatNumber from '../utils/helpers/shortNumber';

// type
import type { GroupSystemStats,DailyActive, TransactionInputStat,AIUsage } from "../model/type/dashboard.type";

import { dashboardApp } from '../application/dashboard.app';

// --- Mock Data ---
// import MOCK_SYSTEM_STATS from '../services/mock/dashboard/systemStats.mock';
// import { getDailyActive, type DailyActive } from '../services/mock/dashboard/dailyActive.mock';
// import {getInputPeriod, type TransactionInputStat} from '../services/mock/dashboard/transactionInputStat.mock';
// import {getAIUsage, type AIUsage} from '../services/mock/dashboard/aiUsage.mock';

const DashboardPage: React.FC = () => {

  const m = new Date().getMonth()+1
  const currenMonth = m <10 ?`0${m}`:m.toString();
  const currentYear = new Date().getFullYear().toString();

  const [loading, setLoading] = useState(false);

  //Selete timeline
  const [activePeriod, setActivePeriod] = useState<"30D" | "7D">('30D');
  const [inputPeriod, setInputPeriod] = useState<"1D" | "30D" | "7D">('30D');
  const [aiPeriod, setAIPeriod] = useState<"30D" | "7D">('30D');

  //month modal
  const [specificTime, setSpecificTime]=useState({month:currenMonth, year:currentYear})
  const [year, setYear] = useState(currentYear)
  const [isOpenMonthModal, setIsOpenMonthModal] = useState(false)

  //data
  const [dailyActive,setDailyActive] = useState<DailyActive[]>([])
  const [transInput,setTransInput] = useState<TransactionInputStat[]>([])
  const [aiUsage, setAIUsage] = useState<AIUsage[]>([])
  const [systemStatus, setSystemStatus]= useState<GroupSystemStats>({
    totalUser:0, 
    activeToday:{
      value:0,
      statChange:{
        status:'positive',
        value:0,
      }
    },
    newUser:{
      value:0,
      statChange:{
        status:'positive',
        value:0,
      }
    }
  })

  useEffect(()=>{
    const fetchData = async ()=>{
      setLoading(true)
      const data = await dashboardApp.getSystemStatsApp();
      setLoading(false)
      setSystemStatus(data as GroupSystemStats)
    }
    fetchData()
  },[])

  //Get Daily Action Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const period: "30D" | "7D" = m === parseInt(specificTime.month) ? activePeriod : "30D";
      const data = await dashboardApp.getDailyActive(specificTime.month, specificTime.year, period);
      setDailyActive(data);
      setLoading(false)
    };
    fetchData();
  }, [specificTime, activePeriod, m]);

  //Get transaction input data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const period: "1D" | "30D" | "7D" = m === parseInt(specificTime.month) ? inputPeriod : "30D";
      const data = await dashboardApp.getTransactionInput(specificTime.month, specificTime.year, period);
      setTransInput(data);
      setLoading(false)
    };
    fetchData();
  }, [specificTime, inputPeriod, m]);

  //Get AI usage
  useEffect(()=>{
    const fetchData = async ()=>{
      setLoading(true)
      const period: "30D" | "7D" = m === parseInt(specificTime.month) ? aiPeriod : "30D";
      setAIPeriod(period)
      const data = await dashboardApp.getAIUsage(specificTime.month, specificTime.year, period)
      setAIUsage(data)
      setLoading(false)
    }
    fetchData()
  }, [specificTime, aiPeriod, m])

  const pieChartLable = useMemo(() => {
    if (!transInput || transInput.length < 2) {
      return { total: '0', userPercen: '0', aiPercen: '0' };
    }

    const total = transInput[0].value + transInput[1].value;
    if (total === 0) return { total: '0', userPercen: '0', aiPercen: '0' };

    const shortTotal = formatNumber(total);
    let userPercen = '0';
    let aiPercen = '0';

    transInput.forEach(i => {
      if (i.type === 'user') {
        userPercen = ((i.value / total) * 100).toFixed(1);
      } else {
        aiPercen = ((i.value / total) * 100).toFixed(1);
      }
    });

    return { total: shortTotal, userPercen, aiPercen };
  }, [transInput]);

  return (
    <div className="dashboard">
      
      {/* Title Section */}
      <div className="dashboard__title-section">
        <div className="dashboart__header">
          <h1 className="dashboard__title">Dashboard Overview</h1>
          <button 
            className='dashboard__title-selecteMonth'
            onClick={()=>setIsOpenMonthModal(true)}
          >{specificTime.month}-{specificTime.year}</button>
        </div>
        <p className="dashboard__subtitle">Welcome back, here's what's happening today.</p>
      </div>

      {/* Stats  */}
      <div className="dashboard__stats">
        
        {/* Card 1 */}
        <div className="stat-card stat-card-users">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--users">
              <HiOutlineUserGroup />
            </div>
          </div>
          <div>
              <div className="stat-card__label">Total Users</div>
              <div className="stat-card__value">{systemStatus.totalUser}</div>
            </div>
        </div>

        {/* Card 2 */}
        <div className="stat-card stat-card-active">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--active">
              <HiOutlineLightningBolt />
            </div>
            <span className={`stat-card__change 
              ${systemStatus.activeToday.statChange.status==="positive"?
                'stat-card__change--positive':'stat-card__change--negative'}
            `}>
              {systemStatus.activeToday.statChange.status==="positive"?<TiArrowSortedUp/>:<TiArrowSortedDown/> }
              {systemStatus.activeToday.statChange.value}%
            </span>
          </div>
          <div>
              <div className="stat-card__label">Active Today</div>
              <div className="stat-card__value">{systemStatus.activeToday.value}</div>
            </div>
        </div>

        {/* Card 3 */}
        <div className="stat-card stat-card-new">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--new">
              <HiOutlineUserAdd />
            </div>
            <span className={`stat-card__change 
              ${systemStatus.newUser.statChange.status==="positive"?
                'stat-card__change--positive':'stat-card__change--negative'}
            `}>
              {systemStatus.newUser.statChange.status==="positive"?<TiArrowSortedUp/>:<TiArrowSortedDown/> }
              {systemStatus.newUser.statChange.value}%
            </span>
          </div>
            <div >
              <div className="stat-card__label">New This Month</div>
              <div className="stat-card__value">{systemStatus.newUser.value}</div> 
            </div>
        </div>

        {/* Card 4 */}
        {/* <div className="stat-card">
          <div className="stat-card__header">
            <div className="stat-card__icon stat-card__icon--sessions">
              <HiOutlineClock />
            </div>
            <span className="stat-card__change stat-card__change--negative">-2%</span>
          </div>
          <div>
            <div className="stat-card__label">Sessions Today</div>
            <div className="stat-card__value">45,102</div>
          </div>
        </div> */}
      </div>

      {/* Daily Active Users Chart */}
      <div className="dashboard__chart-card">
        <div className="dashboard__chart-header">
          <div>
            <h2 className="dashboard__chart-title">Daily Active Users</h2>
            <p className="dashboard__chart-desc">User engagement across the platform</p>
          </div>
          {
            m===parseInt(specificTime.month) && 
            <div className="dashboard__period-toggle">
              {['7D', '30D'].map((p) => (
                <button 
                  key={p} 
                  className={`dashboard__period-btn ${activePeriod === p ? 'active' : ''}`}
                  onClick={() => setActivePeriod(p as '7D'| '30D')}
                >
                  {p}
                </button>
              ))}
            </div>
          }
        </div>
        <div style={{ width: '100%', height: 380 }}>
          <ResponsiveContainer>
            <LineChart data={dailyActive} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" />
               <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#8e99a8', fontWeight: 600, letterSpacing: 0.5 }}
                dy={10}
                width="auto" 
              />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#8e99a8', fontWeight: 600, letterSpacing: 0.5 }}
                dy={10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #f0f1f4', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                cursor={{ stroke: '#e4e7ec', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#3f83f8" 
                strokeWidth={3} 
                dot={{ r: 0 }} 
                activeDot={{ r: 5, fill: '#fff', stroke: '#3f83f8', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard__bottom-row">
        
        {/* Transaction Input */}
        <div className="dashboard__chart-card">
          <div className="dashboard__chart-header">
            <h2 className="dashboard__chart-title">Transaction Input</h2>
            {
              m===parseInt(specificTime.month) &&
              <div className="dashboard__period-toggle">
                {['1D', '7D', '30D'].map(p => (
                  <button 
                    key={p} 
                    className={`dashboard__period-btn ${inputPeriod === p ? 'active' : ''}`}
                    onClick={() => setInputPeriod(p as '1D'| '7D'| '30D')}
                  >
                    {p}
                  </button>
                ))}
              </div>
            }
          </div>
          <div className="dashboard__donut-wrapper">
            <div style={{ width: 160, height: 160, position: 'relative' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={transInput}
                    innerRadius={60}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {transInput.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.type==='user'? '#1a2332':'#5bb8a8'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Custom center label for Pie chart to match design */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span className="dashboard__donut-center-value">{pieChartLable.total}</span>
                <span className="dashboard__donut-center-text">TOTAL</span>
              </div>
            </div>
            
            <div className="dashboard__donut-legend">
              <div className="dashboard__legend-item">
                <div className="dashboard__legend-dot dashboard__legend-dot--scanned"></div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#8e99a8', letterSpacing: '0.5px' }}>AI SCANNED</div>
                  <div style={{ fontWeight: 700, color: '#1a2332' }}>{pieChartLable.aiPercen}%</div>
                </div>
              </div>
              <div className="dashboard__legend-item">
                <div className="dashboard__legend-dot dashboard__legend-dot--manual"></div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#8e99a8', letterSpacing: '0.5px' }}>MANUAL ENTRY</div>
                  <div style={{ fontWeight: 700, color: '#1a2332' }}>{pieChartLable.userPercen}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Usage */}
        <div className="dashboard__chart-card dashboard__colum-chart">
          <div className="dashboard__chart-header">
            <h2 className="dashboard__chart-title">AI Assistant Usage</h2>
            {
              m===parseInt(specificTime.month)&&
                <div className="dashboard__period-toggle">
                {['7D', '30D'].map(p => (
                  <button 
                    key={p} 
                    className={`dashboard__period-btn ${aiPeriod === p ? 'active' : ''}`}
                    onClick={() => setAIPeriod(p as '7D'| '30D')}
                  >
                    {p}
                  </button>
                ))}
              </div>
            }
          </div>
          <div style={{ width: '100%', height: 160 }}>
            <ResponsiveContainer>
              <BarChart data={aiUsage} barSize={aiPeriod==='7D'?30:15} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#8e99a8', fontWeight: 600, letterSpacing: 0.5 }} 
                  dy={8}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[14, 14, 14, 14]}
                  fill="#c7ddf8" // default light blue
                  shape={(props) => {
                    const { x, y, width, height } = props;
                    return (
                      <rect 
                        x={x} 
                        y={y} 
                        width={width} 
                        height={height} 
                        fill='#3f83f8'
                        rx={14} 
                        ry={14} 
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {
        isOpenMonthModal && 
        <MonthModal
          month={specificTime.month}
          year={specificTime.year}
          setTime={setSpecificTime}
          setYear={setYear}
          yearOfMonth={year}
          onClose={() => setIsOpenMonthModal(false)} 
        />
      }
      <LoadingModal isOpen={loading}/>  
    </div>
  );
};

export default DashboardPage;
