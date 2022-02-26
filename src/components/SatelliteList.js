import React, {Component} from 'react';
import { Button, List, Checkbox, Spin, Avatar } from "antd";
import satellite from "../assets/images/satellite.svg";

class SatelliteList extends Component {
    state = {
        selected: []
    }
    render() {
        const satList = this.props.satInfo ? this.props.satInfo.above : [];
        const { isLoad } = this.props;
        const { selected } = this.state;
        return (
            <div className = "sat - list-box">
                <div className="btn-container">
                    <Button
                        className="sat-list-btn"
                        size="large"
                        type = "primary"
                        disabled={ selected.length === 0}
                        onClick = {this.onShowSatMap}
                    >Track on the map</Button>
                </div>
                <hr/>
                {
                    isLoad
                        ?
                        <div className="spin-box">
                            <Spin tip="Loading..." size="large" />
                        </div>

                        :
                        <List
                            className="sat-list"
                            itemLayout="horizontal"
                            size="small"
                            dataSource={satList}
                            renderItem={item => (
                                <List.Item
                                    actions={[<Checkbox dataInfo={item} onChange={this.onChange}/>]}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar size={50} src={satellite}/>}
                                        title={<p>{item.satname}</p>}
                                        description={`Launch Date: ${item.launchDate}`}
                                    />

                                </List.Item>
                            )}
                        />
                }
            </div>
        );
    }

    onChange = e => {
        console.log(e.target);
        // step1: get current selected/unselected satellite
        // step2: remove or add satellite
        const {dataInfo, checked} = e.target;
        const {selected} = this.state;
        const list = this.addOrRemove(dataInfo, checked, selected);
        this.setState({selected: list})
    }

    addOrRemove = (item, status, list) => {
        // case1: check is true;
        //        -> item not in the lsit --> add it
        //        -> item is in the list --> do nothing
        // case2: check is false;
        //        -> item is in the list -> remove it
        //        -> item not in the list -> do nothing
        const found = list.some( sat => sat.satid === item.satid)

        if(status && !found){
            list=[...list, item] //返回新的list
        }

        if(!status && found){
            list = list.filter( entry => {
                return entry.satid !== item.satid;
            });
        }
        return list;
    }

    onShowSatMap = () => {
        // send selected array to Main
        this.props.onShowMap(this.state.selected);
    }

}

export default SatelliteList;