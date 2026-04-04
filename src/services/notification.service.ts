import { API_TAG } from "../constants/apiTag.constant";
import type { CreateNotificationDTO, Notification } from "../types/notification.type";
import { baseApi, BaseFactory } from "./base.service";
import { unwrapItem } from "./responseAdapter";

class NotificationFactory extends BaseFactory<Notification, CreateNotificationDTO, CreateNotificationDTO> {
    constructor() {
        super("/admin/notifications", API_TAG.NOTIFICATIONS);
    }
}

const factory = new NotificationFactory();

export const notificationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        ...factory.build(builder),
        createNotification: builder.mutation<Notification, CreateNotificationDTO>({
            query: (body) => ({
                url: "/notification",
                method: "POST",
                data: body,
            }),
            transformResponse: unwrapItem,
            invalidatesTags: [API_TAG.NOTIFICATIONS],
        }),
    }),
});

export const {
    useCreateNotificationMutation,
    useGetListQuery: useGetAdminNotificationsQuery,
} = notificationApi;
