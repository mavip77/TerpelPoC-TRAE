package com.terpel.sms.api;

import com.terpel.sms.core.NotifyService;
import com.terpel.sms.model.TransferNotifyRequest;
import javax.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notify")
public class NotifyController {

  private final NotifyService notifyService;

  public NotifyController(NotifyService notifyService) {
    this.notifyService = notifyService;
  }

  @PostMapping("/transfer")
  public ResponseEntity<?> notifyTransfer(@Valid @RequestBody TransferNotifyRequest req) {
    boolean ok = notifyService.sendPushTransfer(req);
    return ok ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
  }
}
