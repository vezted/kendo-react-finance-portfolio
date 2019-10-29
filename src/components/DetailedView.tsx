import * as React from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { dataService } from '../services';
import { Chart, ChartSeries, ChartSeriesItem, ChartValueAxis, ChartValueAxisItem, ChartArea, ChartCategoryAxis, ChartCategoryAxisItem } from '@progress/kendo-react-charts';
export interface DetailedViewProps {
    symbols?: string[];
}

const nFormatter = (num: number) => {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num;
}

const ChangeCell = (props: any) => {
    const value = props.dataItem[props.field]
    return (
        <td className={value < 0 ? 'negative-cell' : 'positive-cell'}>
            {value}{props.field === 'change_pct' ? '%' : ''}
        </td>
    )
}

const NumberCell = (props: any) => {
    const value = props.dataItem[props.field]
    return (
        <td>
            {nFormatter(value)}
        </td>
    )
}

const ChartCell = (props: any) => {
    let data = dataService.getSymbol(props.dataItem.symbol)
    let currentHours = 0
    let closeData = data.map(item => {
        if (item.current.getHours() !== currentHours) {
            currentHours = item.current.getHours()
            return item.close
        }
    })
    let filtered = closeData.filter(item => item)
    let color = filtered[0] < filtered[filtered.length-1] ? '#5CB85C' : '#D9534F';
    return (
        <td>
            <Chart style={{ height: 70 }}>
                <ChartValueAxis>
                    <ChartValueAxisItem visible={false} majorGridLines={{ visible: false }} axisCrossingValue={color === 'green' ? 0 : 1000}/>
                </ChartValueAxis>
                <ChartCategoryAxis>
                    <ChartCategoryAxisItem majorGridLines={{ visible: false }} visible={false} />
                </ChartCategoryAxis>
                <ChartSeries>
                    <ChartSeriesItem data={filtered} type='line' markers={{ visible: false }} color={color} />
                    <ChartSeriesItem data={filtered} type='area' markers={{ visible: false }} color={color} opacity={0.2}/>
                </ChartSeries>
            </Chart>
        </td>
    )
}

export const DetailedView: React.FunctionComponent<DetailedViewProps> = (props) => {
    const [data, setData] = React.useState<any[]>([]);

    const fetchData = async () => {
        const newData = await dataService.getAllSymbols();
        setData(newData)
    }
    React.useEffect(() => { fetchData() }, []);
    return (
        <Grid
            data={data}
        >
            <GridColumn field="symbol" title="Symbol" className='symbol-cell' />
            <GridColumn field="name" title="Name" />
            <GridColumn field="price" className='price-cell' />
            <GridColumn field="day_change" title="Change" cell={ChangeCell} />
            <GridColumn field="change_pct" title="% Change" cell={ChangeCell} />
            <GridColumn field="volume" title="Volume" cell={NumberCell} />
            <GridColumn field="volume_avg" title="Avg Vol" cell={NumberCell} />
            <GridColumn field="market_cap" title="Market Cap" cell={NumberCell} />
            <GridColumn field="pe" title="PE Ratio (TTM)" />
            <GridColumn cell={ChartCell} width={200} title='1 Day Chart'/>
        </Grid>
    )
}

DetailedView.defaultProps = {
    symbols: ["SNAP", "TWTR", "VOD.L"]
}