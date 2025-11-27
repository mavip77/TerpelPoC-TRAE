package com.terpel.sms.api;

import com.terpel.sms.core.SmsService;
import com.terpel.sms.model.PaymentRequest;
import com.terpel.sms.model.SecurityRequest;
import com.terpel.sms.model.TransferSmsRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/sms")
@Validated
public class SmsController {
  private final SmsService smsService;

  public SmsController(SmsService smsService) {
    this.smsService = smsService;
  }

  @PostMapping("/transfer")
  public ResponseEntity<Void> sendTransfer(@Valid @RequestBody TransferSmsRequest req) {
    boolean ok = smsService.sendTransferSms(req);
    return ok ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
  }

  @PostMapping("/payment")
  public ResponseEntity<Void> sendPayment(@Valid @RequestBody PaymentRequest req) {
    boolean ok = smsService.sendPayment(req);
    return ok ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
  }

  @PostMapping("/security")
  public ResponseEntity<Void> sendSecurity(@Valid @RequestBody SecurityRequest req) {
    boolean ok = smsService.sendSecurity(req);
    return ok ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
  }
}
