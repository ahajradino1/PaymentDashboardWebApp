import React, { Component } from "react";
import ReactDOM from "react-dom";
import "antd/dist/antd.css";
import { Table, Input, Button, Tag, Typography } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import { getToken } from "../../utilities/Common";
import axios from "axios";
import uuid from "react-uuid";
import "../../css/Transactions.css";

const { Text } = Typography;

class PregledTransakcija extends Component {
  state = {
    searchText: "",
    searchedColumn: "",
    data: [],
    key: 0,
    expandedKeys: [],
  };

  componentWillMount() {
    this.getTransactions();
  }

  getTransactions() {
    axios
      .get("https://payment-server-si.herokuapp.com/api/transactions/all", {
        headers: { Authorization: "Bearer " + getToken() },
      })
      .then((response) => {
        const transactions = [];
        response.data.forEach((transaction) => {
          transactions.push({
            key: ++this.state.key,
            cardNumber: transaction.cardNumber,
            merchantName: transaction.merchantName,
            totalPrice: transaction.totalPrice,
            date: transaction.date.substr(0, 10),
            service: transaction.service,
          });
        });
        this.setState({ data: transactions }, () => {
          //   this.state.data.forEach((element) => {
          //     //   element["key"] = uuid();
          //     element["key"] = ++this.state.key;
          //   });
          console.log(this.state.data);
        });
      })
      .catch((err) => console.log(err));
  }

  getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            this.handleSearch(selectedKeys, confirm, dataIndex)
          }
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: (text) =>
      this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
        text
      ),
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: "" });
  };

  onTableRowExpand(expanded, record) {
    var keys = [];
    if (expanded) {
      keys.push(record.key);
    }

    this.setState({ expandedKeys: keys });
  }

  expandedRowRender = (rowData) => {
    const service = rowData.service;
    const columns = [
      { title: "Item", dataIndex: "item", key: "item" },
      { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    ];

    const items = service.split(",");
    const collapsedData = [];

    for (let i = 0; i < items.length; ++i) {
      let itemData = items[i].split("(");

      collapsedData.push({
        key: i,
        item: itemData[0],
        quantity: itemData[1].substr(0, itemData[1].length - 1),
      });
    }
    return (
      <Table columns={columns} dataSource={collapsedData} pagination={false} />
    );
  };

  render() {
    const columns = [
      {
        title: "Card number",
        dataIndex: "cardNumber",
        key: "cardNumber",
        width: "30%",
        sorter: (a, b) => a.cardNumber - b.cardNumber,
        ...this.getColumnSearchProps("cardNumber"),
      },
      {
        title: "Merchant",
        dataIndex: "merchantName",
        key: "merchantName",
        width: "20%",
        sorter: (a, b) => a.merchantName < b.merchantName,
        ...this.getColumnSearchProps("merchantName"),
      },
      {
        title: "Service",
        dataIndex: "service",
        key: "service",
        ellipsis: true,
      },
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        filters: [
          {
            text: "24 hours",
            value: "24h",
          },
          {
            text: "Last month",
            value: "month",
          },
          {
            text: "Last year",
            value: "year",
          },
        ],
        onFilter: (value, record) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const yesterday = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 1
          );
          const monthAgo = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            today.getDate()
          );
          const yearAgo = new Date(
            today.getFullYear() - 1,
            today.getMonth(),
            today.getDate()
          );

          const day = parseInt(record.date.substr(8, 10));
          const month = parseInt(record.date.substr(5, 7)) - 1;
          const year = parseInt(record.date.substr(0, 4));
          const date = new Date(year, month, day);

          if (value === "24h") {
            console.log(today + " " + date);
            return (
              date.getTime() === today.getTime() ||
              date.getTime() === yesterday.getTime()
            );
          } else if (value == "month") return monthAgo <= date && date <= today;
          return yearAgo <= date && date <= today;
        },
      },
      {
        title: "Value",
        dataIndex: "totalPrice",
        key: "totalPrice",
        sorter: (a, b) => a.totalPrice - b.totalPrice,
        ...this.getColumnSearchProps("totalPrice"),
        render: (price) => (
          <Tag id="tagIznosa" color="red">
            {price} KM
          </Tag>
        ),
      },
    ];
    return (
      <Table
        columns={columns}
        dataSource={this.state.data}
        onExpand={(expanded, render) => this.onTableRowExpand(expanded, render)}
        expandable={{
          expandedRowRender: (record) => this.expandedRowRender(record),
        }}
        expandedRowKeys={this.state.expandedKeys}
        summary={(pageData) => {
          let total = 0;
          pageData.forEach(({ totalPrice }) => {
            total += totalPrice;
          });
          return (
            <>
              <tr>
                <th>Total</th>
                <td></td>
                <td></td>
                <td></td>
                <td id="totalSum">
                  <Text strong>{total} KM</Text>
                </td>
              </tr>
            </>
          );
        }}
      />
    );
  }
}

export default PregledTransakcija;
