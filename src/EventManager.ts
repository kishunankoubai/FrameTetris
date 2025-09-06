/**
 * MyEventに用いられる一意のid
 */
type EventId = number | string;

/**
 * イベント情報
 */
type MyEvent = {
    id: EventId;
    handler: Function;
    classNames: string[];
};

/**
 * MyEventListenerが実装されたクラスが呼び出すイベントを管理する
 */
class EventManager {
    /**
     * 登録されているイベント
     */
    private static eventList: MyEvent[] = [];

    /**
     * 登録されているイベントのid
     */
    static get ids() {
        return this.eventList.map(({ id }) => id);
    }

    /**
     * @param id イベントのid　すでに存在すると失敗する　指定しない場合は自動で割り振る
     * @param handler イベントの処理　必須
     * @param classNames イベントのクラス
     * @returns 追加された/しようとしたイベントのid
     */
    //指定されたhandlerやその他の情報を持つeventを追加する
    //idは指定しなかった場合、被らないように自動的に設定される
    static addEvent({ id, handler, classNames = [] }: { id?: EventId; handler: Function; classNames?: string[] }): EventId {
        if (id) {
            if (!this.ids.includes(id)) {
                this.eventList.push({ id, handler, classNames });
            } else {
                console.error("idが重複しているため、このEventは登録に失敗しました");
            }
            return id;
        } else {
            id = Date.now();
            const ids = this.ids;
            while (ids.includes(id)) {
                id++;
            }
            this.eventList.push({ id, handler, classNames });
            return id;
        }
    }

    /**
     * イベントの登録解除
     * @param eventId 登録を解除したいイベントのid
     */
    static removeEvent(eventId: EventId): void {
        this.eventList = this.eventList.filter(({ id }) => id != eventId);
    }

    /**
     * イベントの登録解除
     * @param eventIds 登録を解除したいイベントのidの配列
     */
    static removeEvents(eventIds: EventId[]): void {
        this.eventList = this.eventList.filter(({ id }) => !eventIds.includes(id));
    }

    /**
     * イベントの一括登録解除
     * @param className 登録を解除したいイベントのclassName
     */
    static removeEventsByClassName(className: string): void {
        this.eventList = this.eventList.filter(({ classNames }) => !classNames.includes(className));
    }

    /**
     * @param eventId イベントのid
     * @returns idが登録されているか
     */
    static hasAlreadyAdded(eventId: EventId): boolean {
        if (!this.ids.includes(eventId)) {
            console.error("指定されたidのEventは登録されていません");
            return true;
        }
        return false;
    }

    /**
     * イベントの実行
     * @param eventId 実行したいイベントのid
     */
    static executeEvent(eventId: EventId): void {
        if (this.hasAlreadyAdded(eventId)) {
            return;
        }
        this.eventList.filter(({ id }) => id == eventId)[0].handler();
    }

    /**
     * イベントの一括実行
     * @param className 実行したいイベントのclassName
     */
    static executeEventsByClassName(className: string) {
        this.eventList
            .filter(({ classNames }) => classNames.includes(className))
            .forEach(({ handler }) => {
                handler();
            });
    }

    //MyEventListenerを実装しているクラスで呼ばれることを想定している
    /**
     * イベントの一括実行
     * @param className 実行したいイベントのclassName
     * @param eventIds 実行したいイベントのidが入った配列
     */
    static executeListeningEvents(className: string, eventIds: EventId[]) {
        this.eventList
            .filter(({ id, classNames }) => eventIds.includes(id) && classNames.includes(className))
            .forEach(({ handler }) => {
                handler();
            });
    }
}

/**
 * イベントを呼ぶことがあるクラス用のインターフェース
 */
type MyEventListener = {
    eventClassNames: string[];
    eventIds?: EventId[];
};
