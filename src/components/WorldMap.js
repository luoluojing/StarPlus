import React, {Component} from 'react';
import axios from 'axios';
import { Spin } from 'antd';
import {feature} from "topojson-client";
import { geoKavrayskiy7 } from "d3-geo-projection";
import { select as d3Select} from 'd3-selection';
import { timeFormat as d3TimeFormat } from 'd3-time-format';
import { schemeCategory10 } from "d3-scale-chromatic";
import * as d3Scale from "d3-scale";


import { WORLD_MAP_URL, SATELLITE_POSITION_URL, SAT_API_KEY } from "../constants";
import {geoGraticule, geoPath} from "d3-geo";

const width = 960;
const height = 600;
class WorldMap extends Component {
    constructor() {
        super();
        this.state = {
            isDrawing: false,
            isLoading: false
        }

        // create a map ref
        this.refMap = React.createRef();
        this.refTrack = React.createRef();
        this.map = null;
        this.color = d3Scale.scaleOrdinal(schemeCategory10);


        //console.log(this.refMap);
    }
    render() {
        const { isLoading } = this.state;

        return (
            <div className = "map-box">{isLoading ? (
                <div className="spinner">
                    <Spin tip="Loading..." size="large" />
                </div>
            ) : null}

                <canvas className = "map" ref = {this.refMap}/>
                <canvas className = "track" ref = {this.refTrack}/>
                <div className = "hint" />
            </div>
        );
    }

    componentDidMount() {
        axios.get(WORLD_MAP_URL)
            .then( res => {
                console.log(res);
                if (res.status === 200) {
                    const { data } = res;
                    //console.log(feature(data, data.objects.countries).features())
                    // convert map data -> GeoJSON
                    const land = feature(data, data.objects.countries).features;
                    //generate map
                    this.generateMap(land);
                }
            })
            .catch( err => {
                console.log('err in fetch map data:', err)
            })
    }

    generateMap = land => {
        // create a projection
        const projection = geoKavrayskiy7()
            .scale(170)
            .translate([width / 2, height / 2])
            .precision(.1)

        const graticule = geoGraticule();
        //console.log(this.refMap);
        // get map canvas
        const canvas = d3Select(this.refMap.current)
            .attr('width', width)
            .attr('height', height);

        const canvas2 = d3Select(this.refTrack.current)
            .attr('width', width)
            .attr('height', height);


        const context = canvas.node().getContext("2d");
        const context2 = canvas2.node().getContext("2d");

        let path = geoPath()
            .projection(projection)
            .context(context);

        land.forEach(ele => {
            context.fillStyle = '#B3DDEF';
            context.strokeStyle = '#000';
            context.globalAlpha = 0.7; //深浅度调节

            // 画笔画每个点
            context.beginPath();
            path(ele);
            context.fill();
            context.stroke();

            context.strokeStyle = 'rgba(220, 220, 220, 0.1)';
            context.beginPath();
            path(graticule());
            context.lineWidth = 0.1;
            context.stroke();

            context.beginPath();
            context.lineWidth = 0.5;
            path(graticule.outline());
            context.stroke();
        });

        this.map = {
            projection: projection,
            graticule: graticule,
            context: context,
            context2: context2
        };

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // case1: setting changes -> not call fetch data fn
        // case2: selected change -> call fetch data dn
        if (prevProps.satData !== this.props.satData) {
            console.log('fetch data')
            // step1: fetch all satellites positions
            // step2: display positions on the map
            const {
                latitude,
                longitude,
                elevation,
                altitude,
                duration
            } = this.props.oberserveData;

            const endTime = duration * 60;

            this.setState({isLoading: true});
            const urls = this.props.satData.map( sat => {
                const { satid } = sat;
                const url = `/api/${SATELLITE_POSITION_URL}/${satid}/${latitude}/${longitude}/${elevation}/${endTime}/&apiKey=${SAT_API_KEY}`;

                return axios.get(url);
            });
            Promise.all(urls)
                .then( results => {
                    console.log(results);
                    const arr = results.map( sat => sat.data )
                    this.setState({
                        isLoading: false,
                        isDrawing: true
                    })

                    // stp2: dispaly positiosn on the map
                    if (!prevState.isDrawing) {
                        this.track(arr);
                    } else {
                        const oHint = document.getElementsByClassName("hint")[0];
                        oHint.innerHTML =
                            "Please wait for these satellite animation to finish before selection new ones!";
                    }
                })
                .catch( err => {
                    console.log('err in fetch position ${err.message}');

                })
        }

    }

    track = data => {
        console.log(data);
        if (!data[0].hasOwnProperty('positions')) {
            throw new Error('no position');
            return;
        }
        const len = data[0].positions.length;
        const { duration } = this.props.oberserveData;
        const {context2} = this.map;

        const now = new Date();
        let i = 0;

        const timer = setInterval(() => {
            const ct = new Date();
            const timePassed = i === 0 ? 0 : ct - now;

            const time = new Date(now.getTime() + timePassed * 60);
            console.log(time)
            // display time
            context2.clearRect(0, 0, width, height);
            context2.font = "bold 14px sans-serif";
            context2.fillStyle = "#333";
            context2.textAlign = "center";
            context2.fillText(d3TimeFormat(time), width / 2, 10);

            if (i >= len) {
                clearInterval(timer);
                this.setState({isDrawing: false});
                const oHint = document.getElementsByClassName('hint')[0];
                oHint.innerHTML = "";
                return;
            }

            // draw each position
            data.forEach(sat => {
                const {info, positions} = sat;
                this.drawSat(info, positions[i]);
            });
            i += 60;

        }, 1000);
    };

        drawSat = (sat, pos) => {
            const { satlongitude, satlatitude } = pos;

            if (!satlongitude || !satlatitude) return;

            const { satname } = sat;
            const nameWithNumber = satname.match(/\d+/g).join("");
            console.log(nameWithNumber)

            const { projection, context2 } = this.map;
            const xy = projection([satlongitude, satlatitude]);

            context2.fillStyle = this.color(nameWithNumber);
            context2.beginPath();
            context2.arc(xy[0], xy[1], 4, 0, 2 * Math.PI);
            context2.fill();

            context2.font = "bold 11px sans-serif";
            context2.textAlign = "center";
            context2.fillText(nameWithNumber, xy[0], xy[1] + 14);
        };

}

export default WorldMap;