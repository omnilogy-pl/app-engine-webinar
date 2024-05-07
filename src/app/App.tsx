import { IntentPayload } from "@dynatrace-sdk/navigation";
import { useDqlQuery } from "@dynatrace-sdk/react-hooks";
import {
  AppHeader,
  AppName,
  convertQueryResultToTimeseries,
  Flex,
  Heading,
  IntentButton,
  Page,
  ProgressCircle,
  SelectV2,
  Surface,
  TimeseriesChart,
} from "@dynatrace/strato-components-preview";
import { Colors } from "@dynatrace/strato-design-tokens";
import React, { useState } from "react";

export const App = () => {
  const [value, setValue] = useState<string>("now()-5d");

  const query = `fetch bizevents, from: ${value}, to: now() | filter source == "CurrencyLayer" and type =="currency.rates" | parse data, "JSON:newData" | fieldsAdd time = timestampFromUnixSeconds(newData[timestamp]) | summarize total=count(), by: { date=bin(toTimestamp(time), 12h), currency=newData[currency], currencyRate=newData[rate] } | fields timeframe=timeframe(from:date, to:date + 1min), currency=currency, currencyRate=currencyRate`;

  const { data, isLoading } = useDqlQuery({
    body: { query },
  });

  const intentPayload: IntentPayload = {
    "dt.query": query,
  };

  return (
    <Page>
      <Page.Header>
        <AppHeader>
          <AppName />
        </AppHeader>
      </Page.Header>
      <Page.Main>
        <Surface minHeight={400}>
          <Flex alignItems="center">
            <Heading>Currency rates</Heading>
            <SelectV2 name="timeframe" value={value} onChange={setValue}>
              <SelectV2.Content>
                <SelectV2.Option value="now()-5d">Last 5 days</SelectV2.Option>
                <SelectV2.Option value="now()-7d">Last 7 days</SelectV2.Option>
                <SelectV2.Option value="now()-9d">Last 9 days</SelectV2.Option>
                <SelectV2.Option value="now()-11d">Last 11 days</SelectV2.Option>
              </SelectV2.Content>
            </SelectV2>
            <IntentButton payload={intentPayload} appId="dynatrace.notebooks" intentId="view-query">
              Open query in Notebook
            </IntentButton>
          </Flex>
          {isLoading && <ProgressCircle />}
          {data && (
            <TimeseriesChart
              data={convertQueryResultToTimeseries(data)}
              variant="line"
              gapPolicy="connect"
              colorPalette="purple-rain"
              curve="smooth"
            >
              <TimeseriesChart.YAxis formatter={(value) => `${value} = 1 PLN`} />
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
