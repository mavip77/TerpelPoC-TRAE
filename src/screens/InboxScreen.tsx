import React, {useEffect, useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {fetchInbox, InboxMessage, markAsRead, syncAndPersistInbox, openSecureDeeplink, markLocalRead} from '../services/inbox';

export default function InboxScreen(): React.JSX.Element {
  const [items, setItems] = useState<InboxMessage[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (loading) return;
    setLoading(true);
    const merged = await syncAndPersistInbox(cursor, 20);
    setItems(merged);
    const page = await fetchInbox(cursor, 20);
    setCursor(page.nextCursor);
    setLoading(false);
  }

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openItem(it: InboxMessage) {
    if (!it.read) {
      await markAsRead(it.id);
      setItems(prev => prev.map(x => (x.id === it.id ? {...x, read: true} : x)));
      await markLocalRead(it.id);
    }
    await openSecureDeeplink(it.deeplink);
  }

  const renderItem = ({item}: {item: InboxMessage}) => (
    <TouchableOpacity style={styles.row} onPress={() => openItem(item)}>
      <View style={styles.rowLeft}>
        {!item.read ? <View style={styles.unreadDot} accessibilityLabel="unread" /> : <View style={styles.readSpacer} />}
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('es-CO')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}><Text style={styles.headerTitle}>Buzón</Text></View>
      <FlatList
        testID="inbox-list"
        data={items}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        onEndReached={() => loadMore()}
        onEndReachedThreshold={0.6}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#f6f8fa'},
  header: {padding: 12, backgroundColor: '#E31E24'},
  headerTitle: {color: '#fff', fontSize: 18, fontWeight: '700'},
  row: {flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff'},
  rowLeft: {width: 24, alignItems: 'center', justifyContent: 'center'},
  unreadDot: {width: 10, height: 10, borderRadius: 5, backgroundColor: '#E31E24'},
  readSpacer: {width: 10, height: 10, borderRadius: 5, backgroundColor: 'transparent'},
  rowBody: {flex: 1},
  title: {fontWeight: '700', color: '#111827'},
  body: {color: '#374151', marginTop: 2},
  date: {color: '#6B7280', marginTop: 6, fontSize: 12},
});
