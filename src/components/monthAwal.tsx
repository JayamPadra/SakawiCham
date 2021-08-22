import React from "react";
import { useState } from "react";
import { Container, Row, Col, Table, ButtonToolbar, ButtonGroup, Button } from "react-bootstrap";
import { AwalMonth, IkasSarak } from "../enums/enum";
import { AwalDate } from "../model/AwalDate";
import { DayAwal } from "./dayAwal";
import dataConfig from '../data/SakawiTakaiCiim.json';

interface MonthAwalProps {
    year: IkasSarak;
    month: AwalMonth;
}

export const MonthAwal = (props: MonthAwalProps) => {
    const [year, setYear] = useState(props.year);
    const [month, setMonth] = useState(props.month);
    let firstDate: AwalDate = { date: 1, month: props.month, year: props.year };
    const [firstDateOfMonth, setFirstDateOfMonth] = useState<AwalDate>(firstDate);
    const [firstDayOfMonth, setFirstDayOfMonth] = useState(0);

    React.useEffect(() => {
        function init() {
            // Read Sakawi Takai Ciim
            let startDay = Number.parseInt(getStartDayByAwalMonth(year, month));
            setFirstDayOfMonth(startDay);

            let firstDate: AwalDate = { date: 1, month: month, year: year };
            setFirstDateOfMonth(firstDate);
        }

        init();
    }, [year, month]);

    function getStartDayByAwalMonth(year: IkasSarak, month: AwalMonth) {
        let yearName = IkasSarak[year];
        let yearItem = dataConfig.filter(x => x.ArabYear === yearName)[0];
        let result = '';

        switch (month) {
            case 0:
                result = yearItem['Month_01'];
                break;
            case 1:
                result = yearItem['Month_02'];
                break;
            case 2:
                result = yearItem['Month_03'];
                break;
            case 3:
                result = yearItem['Month_04'];
                break;
            case 4:
                result = yearItem['Month_05'];
                break;
            case 5:
                result = yearItem['Month_06'];
                break;
            case 6:
                result = yearItem['Month_07'];
                break;
            case 7:
                result = yearItem['Month_08'];
                break;
            case 8:
                result = yearItem['Month_09'];
                break;
            case 9:
                result = yearItem['Month_10'];
                break;
            case 10:
                result = yearItem['Month_11'];
                break;
            case 11:
                result = yearItem['Month_12'];
                break;
            default:
                break;
        }

        return result;
    }

    function getDayNumbersOfMonth(year: IkasSarak, month: AwalMonth) {
        let numberOfDay = 0;

        // Tháng lẻ: (30 ngày), gồm: 1,3,5,7,9,11.
        // Tháng chẳn: (29 ngày), gồm: 2,4,6,8,10. 
        if (month === AwalMonth.Muharam || month === AwalMonth.Rabiulawal || month === AwalMonth.Jamadilawal || 
            month === AwalMonth.Rejab || month === AwalMonth.Ramadan || month === AwalMonth.Julkaejah) {
            numberOfDay = 30;
        } else if (month === AwalMonth.Syafar || month === AwalMonth.Rabiulakhir || month === AwalMonth.Jamadilakhir || 
            month === AwalMonth.Sykban || month === AwalMonth.Syawal ) {
            numberOfDay = 29;
        } else {
            // Riêng tháng 12: năm nhuận (thun "Nâh": Hak, Dal, Jim luic) 30 ngày, 
            // năm thường (thun "Wak") 29 ngày.
            if (year === IkasSarak.Hak || year === IkasSarak.Dal ||year === IkasSarak.JimLuic) {
                numberOfDay =30;
            } else {
                numberOfDay = 29;
            }
        }

        return numberOfDay;
    }

    function addDays(currentDate: AwalDate, addedDays: number) {
        let result: AwalDate = {
            date: 1,
            month: AwalMonth.Jamadilakhir,
            year: IkasSarak.Liéh
          };

        let numberOfDays = getDayNumbersOfMonth(currentDate.year, currentDate.month);
        let newDays = currentDate.date + addedDays;
        let newMonth = currentDate.month;
        let newYear = currentDate.year;

        if (newDays > numberOfDays) {
            if (currentDate.month < 11) {
                newMonth = currentDate.month + 1;
            } else {
                newMonth = 0;
    
                if (currentDate.year < 7) {
                    newYear = currentDate.year + 1;
                } else {
                    newYear = 0;
                }
            }

            result = {
                date: newDays - numberOfDays,
                month: newMonth,
                year: newYear
              };
            
        } else if (newDays <= 0) {
            if (currentDate.month > 0) {
                newMonth = currentDate.month - 1;
            } else {
                newMonth = 11;
    
                if (currentDate.year > 0) {
                    newYear = currentDate.year - 1;
                } else {
                    newYear = 7;
                }
            }

            result = {
                date: getDayNumbersOfMonth(currentDate.year, currentDate.month - 1) + newDays,
                month: newMonth,
                year: newYear
              };
        }  
        else {
            result = {
                date: newDays,
                month: currentDate.month,
                year: currentDate.year
              };
        }

        return result;
    }

    function handleGoToToday() {
        setMonth(AwalMonth.Syafar);
        setYear(IkasSarak.Hak);
    }

    function handleGoToPreviousMonth() {
        if (month > 0) {
            setMonth(month - 1);
        } else {
            setMonth(11);

            if (year > 0) {
                setYear(year - 1);
            } else {
                setYear(7);
            }
        }
    }

    function handleGoToNextMonth() {
        if (month < 11) {
            setMonth(month + 1);
        } else {
            setMonth(0);

            if (year < 7) {
                setYear(year + 1);
            } else {
                setYear(0);
            }
        }
    }

    // draw Calendar Table
    let count = 0;
    let rows = [];

    for (let weeks = 0; weeks < 6; weeks++) {
        let cells = []
        for (let days = 0; days < 7; days++) {
            let cellDate = addDays(firstDateOfMonth, (count - firstDayOfMonth + 1));
            let dateAwal: AwalDate = {
                date: cellDate.date,
                month: cellDate.month,
                year: cellDate.year
            }

            cells.push(<DayAwal key={`cell${weeks}-${days}`} dateAwal={dateAwal}></DayAwal>);
            count++
        }

        rows.push(<tr key={weeks}>{cells}</tr>)
    }

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const tableStyle: React.CSSProperties = {
        height: "400px",
        tableLayout: "fixed"
    }

    return (
        <Container>
            <Row>
                <Col md={4} style={{ textAlign: "left" }}>
                    <ButtonToolbar aria-label="Toolbar with button groups">
                        <ButtonGroup aria-label="Basic example">
                            <Button variant="secondary" className="fa fa-chevron-left" onClick={handleGoToPreviousMonth} />
                            <Button variant="secondary" className="fa fa-chevron-right" onClick={handleGoToNextMonth} />
                        </ButtonGroup>
                        <ButtonGroup aria-label="Third group" style={{ marginLeft: ".75em" }}>
                            <Button variant="secondary" onClick={handleGoToToday}>Today</Button>
                        </ButtonGroup>
                    </ButtonToolbar>
                </Col>
                <Col md={5} style={{ textAlign: "center" }}>
                    <h2>{AwalMonth[month]} {`(${(month + 1)})`} - {IkasSarak[year]}</h2>
                </Col>
                <Col md={3}></Col>
            </Row>
            <Row>
                <Col md={12}>
                    <Table striped bordered hover style={tableStyle}>
                        <thead>
                            <tr>
                                {dayNames.map((d, index) =>
                                    <th style={{ padding: "2px", textAlign: "center" }} key={index}>{d}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
}
