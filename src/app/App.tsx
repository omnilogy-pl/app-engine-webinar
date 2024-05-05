import { useDqlQuery } from "@dynatrace-sdk/react-hooks";
import {
  AppHeader,
  AppName,
  convertQueryResultToTimeseries,
  Heading,
  Page,
  ProgressCircle,
  Surface,
  TimeseriesChart,
} from "@dynatrace/strato-components-preview";
import { Colors } from "@dynatrace/strato-design-tokens";
import React from "react";

export const App = () => {
  const query = `fetch bizevents, from: now()-7d, to: now() | filter source == "CurrencyLayer" and type =="currency.rates" | parse data, "JSON:newData" | fieldsAdd time = timestampFromUnixSeconds(newData[timestamp]) | summarize total=count(), by: { date=bin(toTimestamp(time), 12h), currency=newData[currency], currencyRate=newData[rate] } | fields timeframe=timeframe(from:date, to:date + 1min), currency=currency, currencyRate=currencyRate`;

  const { data, isLoading } = useDqlQuery({
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
          {isLoading && <ProgressCircle />}
          {data && (
            <TimeseriesChart
              data={convertQueryResultToTimeseries(data)}
              variant="line"
              gapPolicy="connect"
              colorPalette="purple-rain"
              curve="smooth"
            >
              <TimeseriesChart.YAxis formatter={(value) => `${value} PLN`} />
              <TimeseriesChart.Threshold
                data={{ value: 0.3 }}
                color={Colors.Charts.Threshold.Bad.Default}
                label="Some threshold label"
              />
            </TimeseriesChart>
          )}
        </Surface>
      </Page.Main>
    </Page>
  );
};
