import { firestore } from "@/lib/firestore";
import type {
    FirestoreDataConverter,
} from "@google-cloud/firestore";


interface HotpCounter {
    counter: number
}

const path = 'HotpCounters'
const converter: FirestoreDataConverter<HotpCounter, HotpCounter> = {
    fromFirestore: (snapshot) => {
        const data = snapshot.data() as HotpCounter
        return data
    },
    toFirestore: ({counter}) => {
        return {
            counter: counter || 0
        }
    }
}

const hotpCounters = firestore.collection(path).withConverter(converter)

export default hotpCounters