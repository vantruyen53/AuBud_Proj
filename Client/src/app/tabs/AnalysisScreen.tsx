import { Text, ScrollView, TouchableOpacity, View,Alert } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useState, useEffect, useMemo } from "react";

import { ITransactionItem, IDateState, IStatisticDate, IStatisticCategory} from "@/src/models/interface/Entities";
import MonthGrid from "@/src/components/monthGrid";
import YearList from "@/src/components/yearList";
import Calendar from "@/src/components/calendar";
import {ModalTime} from '../../components/customModal';
import BarChart from '@/src/components/barChartTransaction';
import { dateFormat, formatCurrency ,convertDateFormat} from "@/src/utils/format";
import HorizontalBar from '@/src/components/horizontalBarChart';
import CategoryPieChart from '@/src/components/pieChart';
import { monthLatinh, transformToHorizontalChartData, transformToPieChartData } from "@/src/utils/helper";
import styles from "@/src/assets/styles/analysisStyle";
import { useProvider } from "@/src/hooks/useProvider";
import { TransactionApp } from "@/src/store/application/TransactionApp";
import {Colors} from '@/src/constants/theme';

export default function AnalysisScreen() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth()+1;
  const day = date.getDate();
  const {id, accessToken}=useProvider()

  const tractionApp = useMemo(
    () => new TransactionApp({ id, accessToken }),
    [id, accessToken]
  );

  const [isOpenMonthGrid, setIsOpenMonthGrid] = useState(false)
  const [isOpenYearList, setIsOpenYearList] =  useState(false)
  const [isOpenCalendar, setIsOpenCalendar] =  useState(false)

  const [timeLine, setTimeLine] = useState<"Date" | "Month" | "Year">("Date")
  const [activeCategoryTab, setActiveCategoryTab] = useState<'sending' | 'income'>("sending");
  const [specificTime, setSpecificTime] = useState<IDateState>({y: year.toString(), m: month.toString(), d: day.toString()});
  const [yearShown, setYearShown] = useState(year);
  const [showModal, setShowModal] = useState(false)

  const [dataHorizontalChart, setDataHorizontalChart] = useState<IStatisticDate[]>([]);
  const [dataPieChart, setDataPieChart]= useState<IStatisticCategory[]>([])

  //DATA MANAGEMENT
    const [allTransactions, setAllTransactions] = useState<ITransactionItem[]>([]);
    const [summary, setSummary] = useState({totalSending: 0,totalIncome: 0,balance: 0,});
    const [monthSummary, setMonthySummary]=useState({avgDaily:0, percent:0, isIncrease:false})
  

  // 1. gán giá trị thời gian hiện tại theo timeLine
  const handleChangeTimeLine = (newTimeLine: "Date" | "Month" | "Year") => {
    setTimeLine(newTimeLine);

    // Update specificTime ngay lập tức, không chờ useEffect
    switch (newTimeLine) {
      case "Date":
        setSpecificTime({ y: year.toString(), m: month.toString(), d: day.toString() });
        break;
      case "Month":
        setSpecificTime({ y: year.toString(), m: month.toString(), d: "" });
        break;
      case "Year":
        setSpecificTime({ y: year.toString(), m: "", d: "" });
        break;
    }
  };

  // 2: fetch data khi specificTime thay đổi
  useEffect(() => {
    const fetchData = async () => {
      const since = timeLine === "Date" ? 'day' : timeLine === "Month" ? 'month' : 'year';
      const result = await tractionApp.getTransactionHistory(
        parseInt(specificTime.d) || 0,
        parseInt(specificTime.m) || 0,
        parseInt(specificTime.y),
        since
      );
      const {avgDaily, percent, isIncrease} = await tractionApp.getMonthlySummary(day, month, year)
      setMonthySummary({avgDaily, percent, isIncrease})
      if (result) {
        setAllTransactions(result.rawTransactions);
        setSummary({
          totalSending: result.totalSending,
          totalIncome: result.totalIncome,
          balance: result.balance,
        });
      }
    };
    fetchData();
  }, [specificTime]);
  
   //Cảnh báo khi người dùng xem năm sau của năm hiện tại
  const handleOverYear = ()=>{
          Alert.alert(
              "Warning",
              "You can't move to year that bigger current year!",
              [
                  { text: "Got it", style: "cancel" }
              ],
          );
  }
 
  //thiết lập giá trị tháng cần xem
  const selecteMonth = (monthSelected:string)=>{
        setSpecificTime({y:yearShown.toString(), m:monthSelected, d:""});
        setIsOpenMonthGrid(false);
  }
  //thiết lập giá trị năm cần xem
  const selectYear = (yearSelected:string)=>{
    setSpecificTime({y:yearSelected.toString(), m:"", d:""});
    setIsOpenYearList(false);
  }
 
  const preYear = (yearShown:number)=> setYearShown(yearShown -1)
  const nexYear = (yearShown:number) => {
        if (yearShown < year) {
            setYearShown(prev => prev + 1);
        } else {
            handleOverYear();
        }
  };

  //thiết lập giá trị cho ngày được chọn
  const handleDateSelect = (year: number, m:number, d:number) => setSpecificTime({y: year.toString(), m: m.toString(), d: d.toString()});

  useEffect(() => {
    if (!allTransactions) return;

    const chartData = transformToHorizontalChartData(allTransactions, timeLine, specificTime);
    const pieChartData  = transformToPieChartData(allTransactions, timeLine, specificTime);

    setDataHorizontalChart(chartData);
    setDataPieChart(pieChartData);

  }, [specificTime, allTransactions]);

  const SectionHeader = ({ title, showMore = true }: { title: string, showMore?: boolean }) => (
    <View style={[styles.sectionHeader, title==="OverView"?{marginTop:24}: null]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {showMore && (
        <TouchableOpacity>
          <Text style={styles.seeMoreText}>More</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  console.log('Data pie chart',dataPieChart)

  const monthLat = monthLatinh(month)

  return (
    <View style={styles.container}>
      {/* HEADER BACKGROUND */}
      <View style={styles.headerBg}>
         <SafeAreaView>
            <View style={styles.topNav}>
               <Text style={styles.navTitle}>Action analysis</Text>
               <View style={styles.selecteTime}>
                  <View style={styles.row}>
                    <TouchableOpacity onPress={()=>setShowModal(true)} style={styles.selecteTimeBTn}>
                      <Text style={styles.selecteTimeText}>{timeLine}</Text>
                      <MaterialIcons name="crop-free" size={14} color='#12D0FF'/>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.row}>
                    <TouchableOpacity onPress={
                          timeLine==="Month"? ()=>setIsOpenMonthGrid(!isOpenMonthGrid):
                          timeLine==="Year" ? ()=>setIsOpenYearList(!isOpenYearList) :
                          ()=> setIsOpenCalendar(!isOpenCalendar)
                        } style={styles.selecteTimeBTn}>
                        <Text style={styles.selecteTimeText}>
                          {
                            timeLine==="Date" ? dateFormat(parseInt(specificTime.d), parseInt(specificTime.m), parseInt(specificTime.y)) :
                            timeLine==="Month" ? `${specificTime.y}/${specificTime.m}`:
                            timeLine==="Year" ? specificTime.y: null
                          }
                        </Text>
                        <MaterialIcons name="crop-free" size={14} color='#12D0FF'/>
                      </TouchableOpacity>
                  </View>
                </View>
            </View>
         </SafeAreaView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {/* Overview bar chart  */}
        <SectionHeader title="OverView" showMore={false}/>
        <BarChart sending={summary.totalSending} income={summary.totalIncome}/>

        {/* Tabs thu-chi*/}
        <View style={styles.segmentControlContainer}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeCategoryTab === "sending" && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveCategoryTab("sending")}
          >
            <Text
              style={[
                styles.segmentText,
                activeCategoryTab === "sending" && styles.segmentTextActive,
              ]}
            >
              Sending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeCategoryTab === "income" && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveCategoryTab("income")}
          >
            <Text
              style={[
                styles.segmentText,
                activeCategoryTab === "income" && styles.segmentTextActive,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/*Bar chart statistics by time  */}
        <SectionHeader title="Statistics balance" showMore={false}/>
        <HorizontalBar 
          data={dataHorizontalChart}
          type={activeCategoryTab} //sending or income
          timeLine={timeLine}
          month={parseInt(specificTime.m)}
          year={parseInt(specificTime.y)}/>

        {/*Pie chart statistics by category */}
        <SectionHeader title="Statistics category" showMore={false}/>
        <CategoryPieChart
          type={activeCategoryTab}
          data={dataPieChart}
          showLabel={true}
        />

        {/* BOTTOM STATS */}
        <View style={styles.bottomStats}>
           <View style={styles.statRow}>
              <Text style={styles.statLabel}>
                {`Average daily spending in ${monthLat}`}
              </Text>
              <Text style={styles.statValue}>{formatCurrency(monthSummary.avgDaily, {absolute:true})}</Text>
           </View>

           <View style={styles.divider} />

           <View style={styles.statRow}>
              <Text style={styles.statLabel}>Difference compared to last month</Text>
               <View style={styles.trendRow}>
                <MaterialIcons name={monthSummary.isIncrease?"arrow-drop-up":"arrow-drop-down"} size={25} color={monthSummary.isIncrease? Colors.light.error:Colors.light.success} />
                <Text style={[styles.trendText, { color:monthSummary.isIncrease? Colors.light.error:Colors.light.success }]}>{monthSummary.percent}%</Text>
              </View>
           </View>
        </View>
      </ScrollView>

      {isOpenMonthGrid && timeLine==="Month" ? 
        <MonthGrid
          yearShown={yearShown}
          preYear={()=>preYear(yearShown)}
          nexYear={()=>nexYear(yearShown)}
          specificTime={specificTime}
          selecteMonth={selecteMonth}
        /> : isOpenYearList && timeLine ==="Year" ?
        <YearList
          currentYear={year}
          selectYear={selectYear}
          specificTime={specificTime}
        /> : isOpenCalendar && timeLine ==="Date"?
         <Calendar
          onPress={(year: number, m:number, d:number) =>handleDateSelect(year, m ,d) }
          onPressClose={()=>setIsOpenCalendar((pre)=>!pre)}
          specificTime={specificTime}
        /> : null}
        <ModalTime
          isVisible={showModal}
          onPressClose={()=>setShowModal(false)}
          timeLine={timeLine}
          setTimeLine={handleChangeTimeLine}
        />
    </View>
  )
}