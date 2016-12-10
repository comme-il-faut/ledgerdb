package ledgerdb.server.db;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import java.io.IOException;
import static org.junit.Assert.*;
import org.junit.Ignore;
import org.junit.Test;

public class PostingTest {

    private final String s;
    
    public PostingTest() {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("'postingDate':'2016-11-26','description':'Testing123'");
        sb.append(",'details':[");
        sb.append("{'accountId':1000,'amount':'12.34'}");
        sb.append(",{'accountId':1200,'amount':'-12.34'}");
        sb.append("]}");
        
        s = sb.toString().replace('\'', '\"');
    }
    
    @Test
    public void testParseJsonNode() throws IOException {
        ObjectMapper om = new ObjectMapper();
        JsonNode jsonNode = om.readTree(s);
        assertEquals("Testing123", jsonNode.get("description").textValue());
    }
    
    @Test
    @Ignore //TODO FIXME
    /*
    com.fasterxml.jackson.databind.JsonMappingException:
    Can not instantiate value of type [simple type, class java.time.LocalDate]
    from String value ('2016-11-26');
    no single-String constructor/factory method
    */
    public void testObjectReader() throws IOException {
        ObjectMapper om = new ObjectMapper();
        ObjectReader or = om.readerFor(PostingHeader.class);
        
        PostingHeader ph = or.readValue(s);
        
        assertNotNull(ph);
        assertEquals("Testing123", ph.getDescription());
        assertEquals(2, ph.getPostingDetails().size());
        
        ph.getPostingDetails().forEach(pd ->
                assertNull(pd.getPostingHeader())
                //assertSame(ph, pd.getPostingHeader())
        );
    }
}
