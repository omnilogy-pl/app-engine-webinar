import { useDqlQuery } from "@dynatrace-sdk/react-hooks";
import {
  AppHeader,
  AppName,
  convertQueryResultToTimeseries,
  Heading,
  Page,
  Surface,
  TimeseriesChart,
} from "@dynatrace/strato-components-preview";
import React from "react";

export const App = () => {
  const query = `fetch bizevents, from: now()-7d, to: now() | filter source == "CurrencyLayer" and type =="currency.rates" | parse data, "JSON:newData" | fieldsAdd time = timestampFromUnixSeconds(newData[timestamp]) | summarize total=count(), by: { date=bin(toTimestamp(time), 12h), currency=newData[currency], currencyRate=newData[rate] } | fields timeframe=timeframe(from:date, to:date + 1min), currency=currency, currencyRate=currencyRate`;

  const { data } = useDqlQuery({
    body: { query },
  });
  return (
    <Page>
      <Page.Header>
        <AppHeader>
          <AppName />
        </AppHeader>
      </Page.Header>
      <Page.Main>
        <Surface minHeight={400}>
          <Heading>Currency rates</Heading>
          {data && <TimeseriesChart data={convertQueryResultToTimeseries(data)}></TimeseriesChart>}
        </Surface>
      </Page.Main>
    </Page>
  );
};
