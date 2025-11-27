package com.terpel.sms.api;

import com.terpel.sms.core.NotifyService;
import com.terpel.sms.model.TransferNotifyRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/notify")
@Validated
public class NotifyController {
  private final NotifyService notifyService;

  public NotifyController(NotifyService notifyService) {
    this.notifyService = notifyService;
  }

  @PostMapping("/transfer")
  public ResponseEntity<Void> sendTransfer(@Valid @RequestBody TransferNotifyRequest req) {
    boolean ok = notifyService.sendPushTransfer(req);
    return ok ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
  }
}
