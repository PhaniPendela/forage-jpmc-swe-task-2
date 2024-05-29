import React, { Component } from "react";
import { Table } from "@finos/perspective";
import { ServerRespond } from "./DataStreamer";
import "./Graph.css";

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[];
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void;
} // This extends helps to modify the current one to HTMLElement to impot to webpage

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  table: Table | undefined;

  render() {
    return React.createElement("perspective-viewer");
  }

  componentDidMount() {
    // Get element to attach the table from the DOM.
    const elem = (document.getElementsByTagName(
      "perspective-viewer"
    )[0] as unknown) as PerspectiveViewerElement;
    //This can be assigned because of the reason that we already made the elem to be a HTML element
    const schema = {
      stock: "string",
      top_ask_price: "float",
      top_bid_price: "float",
      timestamp: "date",
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.

      // Add more Perspective confriguations here.
      elem.load(this.table);
      elem.setAttribute("view", "y_line"); //The line of graph
      elem.setAttribute("column-pivots", '["stock"]'); //It maintaines stock names so we update it with names
      elem.setAttribute("row-pivots", '["timestamp"]'); //x-axis needs to have timestamps
      elem.setAttribute("columns", '["top_ask_price"]'); //for columns i.e on y-axis we only need the top ask price
      elem.setAttribute(
        "aggregates",
        `{
          "stock" : "distinct count",
          "top_ask_price" : "avg",
          "top_bid_price" : "avg",
          "timestamp" : "distinct count"
        }`
      ); //checks for the similarity and if similar then we aggregate those points i.e converge into single point
    }
  }

  componentDidUpdate() {
    // Everytime the data props is updated, insert the data into Perspective table
    if (this.table) {
      // As part of the task, you need to fix the way we update the data props to
      // avoid inserting duplicated entries into Perspective table again.
      this.table.update(
        this.props.data.map((el: any) => {
          // Format the data from ServerRespond to the schema
          return {
            stock: el.stock,
            top_ask_price: (el.top_ask && el.top_ask.price) || 0,
            top_bid_price: (el.top_bid && el.top_bid.price) || 0,
            timestamp: el.timestamp,
          };
        })
      );
    }
  }
}

export default Graph;
