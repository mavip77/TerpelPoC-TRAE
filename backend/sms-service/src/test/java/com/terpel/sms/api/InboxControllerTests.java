package com.terpel.sms.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InboxController.class)
class InboxControllerTests {

  @Autowired
  private MockMvc mockMvc;

  @Test
  void historyReturnsItemsSortedAndCursor() throws Exception {
    mockMvc.perform(get("/api/inbox/history"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items").isArray())
        .andExpect(jsonPath("$.items[0]").value(notNullValue()))
        .andExpect(jsonPath("$").value(hasKey("nextCursor")));
  }

  @Test
  void markReadReturnsOkForExistingId() throws Exception {
    String body = mockMvc.perform(get("/api/inbox/history").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andReturn().getResponse().getContentAsString();
    ObjectMapper om = new ObjectMapper();
    Map<?,?> parsed = om.readValue(body, Map.class);
    List<Map<String,Object>> items = (List<Map<String,Object>>) parsed.get("items");
    String id = (String) items.get(0).get("id");
    mockMvc.perform(post("/api/inbox/read/" + id))
        .andExpect(status().isOk());
  }
}

