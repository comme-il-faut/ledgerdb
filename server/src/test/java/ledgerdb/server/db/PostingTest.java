package ledgerdb.server.db;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import java.io.IOException;
import static org.junit.Assert.*;
import org.junit.Test;

public class PostingTest {

    private final String s;
    
    public PostingTest() {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("'posting_date':'2016-11-26','description':'Testing123'");
        sb.append(",'details':[");
        sb.append("{'account_id':1000,'amount':'12.34'}");
        sb.append(",{'account_id':1200,'amount':'-12.34'}");
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
