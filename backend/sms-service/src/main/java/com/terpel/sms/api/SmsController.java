package com.terpel.sms.api;

import com.terpel.sms.core.SmsService;
import com.terpel.sms.model.PaymentRequest;
import com.terpel.sms.model.SecurityRequest;
import com.terpel.sms.model.TransferSmsRequest;
import javax.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sms")
public class SmsController {

  private final SmsService smsService;

  public SmsController(SmsService smsService) {
    this.smsService = smsService;
  }

  @PostMapping("/payment")
  public ResponseEntity<?> sendPayment(@Valid @RequestBody PaymentRequest req) {
    boolean ok = smsService.sendPayment(req);
    return ok ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
  }

  @PostMapping("/security")
  public ResponseEntity<?> sendSecurity(@Valid @RequestBody SecurityRequest req) {
    boolean ok = smsService.sendSecurity(req);
    return ok ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
  }

  @PostMapping("/transfer")
  public ResponseEntity<?> sendTransfer(@Valid @RequestBody TransferSmsRequest req) {
    boolean ok = smsService.sendTransferSms(req);
    return ok ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
  }
}
