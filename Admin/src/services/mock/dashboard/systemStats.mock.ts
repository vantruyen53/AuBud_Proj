import type {GroupSystemStats } from "../../../model/type/dashboard.type";

const MOCK_SYSTEM_STATS:GroupSystemStats={
    totalUser:123,
    activeToday:{
        value:34,
        statChange:{
            status:'positive',
            value:12
        }
    },
    newUser:{
        value:12,
        statChange:{
            status:'negative',
            value:7
        }
    }
}

export default MOCK_SYSTEM_STATS