package ledgerdb.server;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class JsonUtils {

    public static String format(ResultSet rs) throws SQLException, JsonProcessingException {
        List<Map<String, Object>> rows = new ArrayList<>();
        
        ResultSetMetaData md = rs.getMetaData();
        int columnCount = md.getColumnCount();
        while (rs.next()) {
            Map<String, Object> row = new LinkedHashMap<>();
            for (int i = 1; i <= columnCount; i++) {
                row.put(md.getColumnName(i), rs.getObject(i));
            }
            rows.add(row);
        }
        
        ObjectMapper mapper = new ObjectMapper();
        return mapper.writeValueAsString(rows);
    }
}
