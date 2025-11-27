package com.terpel.sms.api;

import com.terpel.sms.model.InboxPage;
import com.terpel.sms.model.InboxMessage;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/inbox")
@Validated
public class InboxController {
  private final Map<String, InboxMessage> store = new LinkedHashMap<>();

  public InboxController() {
    for (int i = 0; i < 5; i++) {
      String id = UUID.randomUUID().toString();
      InboxMessage m = new InboxMessage();
      m.setId(id);
      m.setTitle("Mensaje " + (i + 1));
      m.setBody("Contenido del mensaje " + (i + 1));
      m.setCreatedAt(Instant.now().minusSeconds(i * 3600).toString());
      m.setRead(i % 2 == 0);
      m.setDeeplink("terpel://promo/" + (i + 1));
      store.put(id, m);
    }
  }

  @GetMapping("/history")
  public ResponseEntity<InboxPage> history(@RequestParam(name = "cursor", required = false) String cursor,
                                           @RequestParam(name = "limit", required = false, defaultValue = "20") int limit) {
    List<InboxMessage> all = new ArrayList<>(store.values());
    all.sort(Comparator.comparing(InboxMessage::getCreatedAt).reversed());
    int start = 0;
    if (cursor != null) {
      for (int i = 0; i < all.size(); i++) {
        if (Objects.equals(all.get(i).getId(), cursor)) { start = i + 1; break; }
      }
    }
    int end = Math.min(start + limit, all.size());
    List<InboxMessage> pageItems = all.subList(start, end);
    String nextCursor = end < all.size() ? all.get(end - 1).getId() : null;
    InboxPage page = new InboxPage();
    page.setItems(pageItems);
    page.setNextCursor(nextCursor);
    return ResponseEntity.ok(page);
  }

  @PostMapping("/read/{id}")
  public ResponseEntity<Void> markRead(@PathVariable("id") String id) {
    InboxMessage m = store.get(id);
    if (m == null) return ResponseEntity.notFound().build();
    m.setRead(true);
    return ResponseEntity.ok().build();
  }
}
