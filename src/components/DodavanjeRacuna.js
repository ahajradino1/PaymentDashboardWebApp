import React, { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, Tooltip, message } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import "../css/DodavanjeRacuna.css";
import kartice from "../img/creditcards1.png";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { getToken, getUser } from "../utilities/Common";

function DodavanjeRacuna() {
  const [accOwner, setAccOwner] = useState({ value: "" });
  const history = useHistory();

  useEffect(() => {
    setAccOwner({
      value:
        JSON.parse(getUser()).firstName + " " + JSON.parse(getUser()).lastName,
    });
  }, []);

  const onFinish = (values) => {
    console.log("Received values of form: ", values);

    const data = {
      accountOwner: accOwner.value,
      //  bankName: values.bankName,
      bankName: "bank",
      expiryDate: "25.03.2023",
      // "01." +
      // ("0" + (values.expiryDate._d.getMonth() + 1)).slice(-2) +
      // "." +
      // values.expiryDate._d.getFullYear(),
      cvc: values.cvc,
      cardNumber: values.cardNumber,
    };

    axios
      .post("https://payment-server-si.herokuapp.com/api/accounts/add", data, {
        headers: {
          Authorization: "Bearer " + getToken(),
        },
      })
      .then((res) => {
        if (res.data.success === true) history.push("/racunUspjeh");
      })
      .catch((err) => {
        if (err.response.data.status === 404)
          message.error(err.response.data.message);
      });
  };

  return (
    <div>
      <h1>Add new bank account</h1>
      <div className="container">
        <Form name="add-account" className="accForm" onFinish={onFinish}>
          <Form.Item label="Card number" colon="false">
            <Form.Item
              name="cardNumber"
              rules={[
                { required: true, message: "Card number is required" },
                { len: 16, message: "Card number must have 16 digits" },
                { message: "Only numbers can be entered", pattern: /^[0-9]+$/ },
              ]}
            >
              <Input style={{ width: 200 }} placeholder="Enter card number" />
            </Form.Item>
          </Form.Item>

          <Form.Item colon="false" label="Expiration date">
            <Form.Item name="expiryDate">
              <Input readOnly style={{ width: 150 }} placeholder="2023-03-25" />
              {}
            </Form.Item>
          </Form.Item>

          <Form.Item colon="false" label="CVC">
            <Form.Item
              name="cvc"
              rules={[
                { required: true, message: "CVC is required" },
                { len: 3, message: "Card number must have 3 digits" },
                { message: "Only numbers can be entered", pattern: /^[0-9]+$/ },
              ]}
            >
              <Input style={{ width: 150 }} placeholder="Enter CVC" />
            </Form.Item>
          </Form.Item>

          <Form.Item colon="false" label="Cardholder name: ">
            <Form.Item name="imeVlasnika">
              <Input
                readOnly
                style={{ width: 200 }}
                defaultValue={accOwner.value}
                placeholder={accOwner.value}
                suffix={
                  <Tooltip title="You must be account owner">
                    <QuestionCircleOutlined />
                  </Tooltip>
                }
              ></Input>
            </Form.Item>
          </Form.Item>

          <Form.Item>
            <Button className="dodajRacun" type="primary" htmlType="submit">
              Add account
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div className="imgContainer">
        <img src={kartice} alt="kartice"></img>
      </div>
    </div>
  );
}

export default DodavanjeRacuna;
