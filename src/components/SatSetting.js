import React, {Component} from 'react';
import {Form, Button, InputNumber } from "antd";

class SatSettingForm extends Component {
    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 11 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 13 },
            },
        };
        console.log(this.props.form);
        return (
           <Form {...formItemLayout} onSubmit = {this.showSatellite}>
               <Form.Item label="Longitude(degrees)">
                   {
                       getFieldDecorator("longitude", {
                       rules: [
                           {
                               required: true,
                               message: "Please input your Longitude"
                           }
                       ]
                   })(
                       <InputNumber
                           min={-180}
                           max={180}
                           style={{ width: "100%" }}
                           placeholder="Please input Longitude"
                       />
                   )}
               </Form.Item>
               <Form.Item label="Latitude(degrees)">
                   {getFieldDecorator("latitude", {
                       rules: [
                           {
                               required: true,
                               message: "Please input your Latitude"
                           }
                       ]
                   })(
                       <InputNumber
                           placeholder="Please input Latitude"
                           min={-90}
                           max={90}
                           style={{ width: "100%" }}
                       />
                   )}
               </Form.Item>

               <Form.Item label="Elevation(meters)">
                   {getFieldDecorator("elevation", {
                       rules: [
                           {
                               required: true,
                               message: "Please input your Elevation"
                           }
                       ]
                   })(
                       <InputNumber
                           placeholder="Please input Elevation"
                           min={-413}
                           max={8850}
                           style={{ width: "100%" }}
                       />
                   )}
               </Form.Item>

               <Form.Item label="Altitude(degrees)">
                   {getFieldDecorator("altitude", {
                       rules: [
                           {
                               required: true,
                               message: "Please input your Altitude"
                           }
                       ]
                   })(
                       <InputNumber
                           placeholder="Please input Altitude"
                           min={0}
                           max={90}
                           style={{ width: "100%" }}
                       />
                   )}
               </Form.Item>

               <Form.Item label="Duration(secs)">
                   {getFieldDecorator("duration", {
                       rules: [
                           {
                               required: true,
                               message: "Please input your Duration"
                           }
                       ]
                   })(
                       <InputNumber
                           placeholder="Please input Duration"
                           min={0}
                           max={90}
                           style={{ width: "100%" }}
                       />
                   )}
               </Form.Item>

               <Form.Item className="show-nearby">
                   <Button
                       type="primary"
                       htmlType="submit"
                       style={{ textAlign: "center" }}
                   >
                       Find Nearby Satellite
                   </Button>
               </Form.Item>
            </Form>

        );
    }

    showSatellite = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this.props.onShow(values);
            }
        });
    };

        //HOF -- higher ordered function:
        //1. 函数参数是函数；
        //2. 函数返回的是个函数

}

const SatSetting = Form.create({name:'satellite-setting'})(SatSettingForm)
export default SatSetting;