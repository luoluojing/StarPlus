import React, {Component} from 'react';
import { Row, Col } from 'antd';
import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList";
import {SAT_API_KEY, NEARBY_SATELLITE, STARLINK_CATEGORY} from "../constants";
import axios from 'axios';
import WorldMap from "./WorldMap";


class Main extends Component {
    constructor(){
        super();
        this.state = {
            satInfo: null,
            satList: null,
            settings: null,
            isLoadingList: false
        }
    }


    render() {
        const { satInfo, satList, settings, isLoadingList } = this.state;
        return (
            <Row className = "main">
                <Col
                    className="left-side"
                    span = {8}
                >
                    <SatSetting onShow={this.showNearbySatellite}/>
                    <SatelliteList
                        satInfo = {satInfo}
                        isLoad = {isLoadingList}
                        onShowMap={this.showMap}
                        />
                </Col>
                <Col
                    className="right-side"
                    span = {16}
                >
                    <WorldMap
                        satData = {satList} oberserveData = {settings}
                    />
                </Col>
            </Row>
        );
    }

    showNearbySatellite = setting => {
        console.log(setting);
        this.setState({
            isLoadingList: true,
            settings: setting
        })

        //fetch set list from the server
        this.fetchSatellite(setting);
    }

    fetchSatellite = setting => {
        // step1: get all settings
        // step2: fetch satallite
        //   case1: success-> update sateinfo
        //   case2: fail -> display err
        const {latitude, longitude, elevation, altitude} = setting;
        const url = `/api/${NEARBY_SATELLITE}/${latitude}/${longitude}/${elevation}/${altitude}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;
        this.setState({
            isLoadingList: true
        });

        axios.get(url)
            .then(response => {
                console.log(response.data)
                this.setState({
                    satInfo: response.data,
                    isLoadingList: false
                })
            })
            .catch(error => {
                console.log('err in fetch satellite -> ', error);
            })

    }

    showMap = selected => {
        this.setState( preState => ({
            ...preState,
            satList: [...selected]
        }))
    }
}

export default Main;