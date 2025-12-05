import { BlogPost } from '@/types';

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Cách nhận biết thịt heo bơm nước chỉ trong 5 giây',
    excerpt: 'Thịt heo bơm nước thường có màu nhạt, rỉ dịch nhiều khi cắt. Xem ngay mẹo để tránh mua phải hàng kém chất lượng.',
    category: 'Mẹo vặt',
    date: '12/10/2024',
    author: 'Minh Tú',
    authorRole: 'Chuyên gia ATTP',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    // High quality raw meat texture
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Thịt heo bị bơm nước không chỉ làm tăng trọng lượng ảo (khiến bạn mất tiền oan) mà còn tiềm ẩn nguy cơ nhiễm khuẩn cao do nguồn nước sử dụng thường không đảm bảo vệ sinh. Vi khuẩn từ nước bẩn sẽ thẩm thấu sâu vào từng thớ thịt, làm thịt nhanh hỏng ngay cả khi bảo quản lạnh.</p>
      
      <p>Là người tiêu dùng thông thái, bạn cần nắm vững 3 nguyên tắc vàng dưới đây để bảo vệ sức khỏe gia đình.</p>

      <h3>1. Quan sát màu sắc (Visual Check)</h3>
      <p>Thịt heo "sạch" và ngon thường có màu hồng tươi hoặc đỏ nhạt, lớp mỡ trắng trong hoặc hơi ngà. Ngược lại, thịt bơm nước thường có màu nhạt thếch, tái đi giống như thịt đã rửa qua nước nhiều lần. Đôi khi, người bán sử dụng phẩm màu để ngụy trang, khiến thịt có màu đỏ rực bất thường.</p>
      
      <figure>
        <img src="https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800" alt="So sánh màu sắc thịt" />
        <figcaption>Thịt heo tươi (trái) có màu hồng tự nhiên, không bị tái nhợt.</figcaption>
      </figure>

      <h3>2. Kiểm tra độ đàn hồi (Touch Test)</h3>
      <p>Đây là cách kiểm tra chính xác nhất. Hãy dùng ngón tay ấn nhẹ vào phần nạc của miếng thịt:</p>
      <ul>
        <li><strong>Thịt tươi:</strong> Có độ đàn hồi tốt, vết lõm biến mất ngay khi nhấc tay ra. Cảm giác thịt dẻo, hơi dính nhẹ tay.</li>
        <li><strong>Thịt bơm nước:</strong> Cảm giác nhão, bọng nước. Vết lõm lâu đàn hồi lại. Khi ấn mạnh có thể thấy nước rỉ ra.</li>
      </ul>

      <h3>3. Quan sát vết cắt</h3>
      <p>Khi người bán cắt thịt, hãy để ý kỹ mặt cắt. Thịt ngon sẽ khô ráo, thớ thịt se lại. Thịt bơm nước sẽ có nước dịch màu hồng nhạt rỉ ra liên tục từ thớ thịt, làm ướt thớt.</p>
      
      <blockquote>
        "Mẹo nhỏ: Mang theo một tờ khăn giấy khô khi đi chợ. Thấm nhẹ vào bề mặt thịt. Nếu khăn khô hoặc chỉ ẩm nhẹ do dầu/mỡ thì là thịt ngon. Nếu khăn ướt đẫm nước ngay lập tức và nát ra thì tuyệt đối không mua."
      </blockquote>
    `
  },
  {
    id: '2',
    title: 'Nhiệt độ bảo quản thịt trong tủ lạnh: Đừng để sai lầm làm hỏng bữa ăn',
    excerpt: 'Sai lầm phổ biến khi chỉnh nhiệt độ tủ lạnh khiến thịt nhanh hỏng và mất chất dinh dưỡng.',
    category: 'Sơ chế',
    date: '15/10/2024',
    author: 'Dr. Food',
    authorRole: 'Bác sĩ Dinh dưỡng',
    authorAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
    // Clear fridge/storage image
    image: 'https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Bảo quản thịt đúng cách giúp giữ nguyên hương vị và dinh dưỡng. Tuy nhiên, nhiều người vẫn mắc sai lầm về nhiệt độ khiến vi khuẩn sinh sôi ngay trong tủ lạnh.</p>
      
      <h3>Ngăn mát: 0°C đến 4°C</h3>
      <p>Đây là "vùng nguy hiểm" nếu để quá lâu. Ở nhiệt độ này, vi khuẩn chỉ phát triển chậm lại chứ không chết đi. Chỉ nên để thịt dùng trong ngày hoặc tối đa 2 ngày. Hãy bọc kín bằng màng bọc thực phẩm hoặc hộp chuyên dụng để tránh nhiễm khuẩn chéo sang rau củ.</p>
      
      <img src="https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=800" alt="Bảo quản tủ lạnh" />

      <h3>Ngăn đông: -18°C (Tiêu chuẩn vàng)</h3>
      <p>Đây là nhiệt độ lý tưởng để nước trong tế bào thịt đóng băng thành tinh thể nhỏ, và vi khuẩn rơi vào trạng thái "ngủ đông" hoàn toàn. Thịt có thể để được 3-6 tháng mà vẫn giữ được chất lượng khoảng 90%.</p>

      <h3>Lưu ý khi rã đông</h3>
      <p>Tuyệt đối không rã đông bằng nước nóng hoặc để ở nhiệt độ phòng quá lâu. Cách tốt nhất là chuyển từ ngăn đông xuống ngăn mát trước 1 đêm.</p>
    `
  },
  {
    id: '3',
    title: 'Giải mã hiện tượng thịt bò bị thâm đen: Ăn hay bỏ?',
    excerpt: 'Đừng vội vứt đi! Đôi khi thịt bò thâm chỉ do thiếu oxy hoá, không phải do hư hỏng.',
    category: 'Khoa học',
    date: '18/10/2024',
    author: 'Chef Gordon',
    authorRole: 'Bếp trưởng',
    authorAvatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&q=80&w=200',
    image: 'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Nhiều bà nội trợ khi thấy thịt bò mua về để trong tủ lạnh hoặc thịt bò hút chân không có màu nâu thâm đen thì vội vàng vứt đi vì nghĩ thịt đã hỏng. Khoan đã! Bạn có thể đang lãng phí một miếng thịt ngon.</p>
      
      <h3>Tại sao thịt bò lại đỏ?</h3>
      <p>Màu đỏ của thịt bò đến từ Myoglobin - một loại protein vận chuyển oxy trong cơ bắp. Khi Myoglobin tiếp xúc với Oxy trong không khí, nó chuyển thành Oxymyoglobin có màu đỏ cherry tươi tắn mà chúng ta thích.</p>

      <img src="https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=800" alt="Màu sắc thịt bò" />

      <h3>Tại sao thịt chuyển màu thâm?</h3>
      <p>Khi thịt bò bị thiếu oxy (ví dụ: các miếng thịt xếp chồng lên nhau, hoặc được hút chân không), Myoglobin chuyển về dạng Deoxymyoglobin có màu tím sẫm hoặc nâu đen. Đây là phản ứng hóa học hoàn toàn tự nhiên.</p>

      <h3>Cách kiểm tra nhanh</h3>
      <p>Hãy để miếng thịt ra ngoài không khí khoảng 15-20 phút. Nếu thịt chuyển đỏ trở lại, đó là thịt tươi. Nếu thịt vẫn thâm đen, có nhớt, và có mùi hôi chua, đó là lúc bạn nên vứt bỏ vì quá trình oxy hóa đã làm hỏng thịt (Metmyoglobin).</p>
    `
  },
  {
    id: '4',
    title: 'Thịt gà và Salmonella: Tại sao không nên rửa gà?',
    excerpt: 'Rửa gà dưới vòi nước là thói quen của 90% người Việt, nhưng khoa học khuyên ngược lại.',
    category: 'Cảnh báo',
    date: '20/10/2024',
    author: 'Y Tế 24h',
    authorRole: 'Ban biên tập',
    authorAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Thịt gà sống thường chứa vi khuẩn Salmonella và Campylobacter. Theo CDC Hoa Kỳ, rửa gà dưới vòi nước mạnh có thể làm bắn vi khuẩn ra xa tới 50cm, bám vào bồn rửa, quần áo, bát đĩa và các thực phẩm ăn sống (rau sống) để gần đó.</p>
      
      <figure>
        <img src="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=800" alt="Rửa gà dưới vòi nước" />
        <figcaption>Rửa gà làm bắn vi khuẩn khắp gian bếp.</figcaption>
      </figure>

      <p>Nhiệt độ nấu chín mới là thứ tiêu diệt vi khuẩn, không phải nước lã.</p>
      
      <h3>Quy trình sơ chế chuẩn:</h3>
      <ol>
        <li>Lấy gà ra khỏi bao bì.</li>
        <li>Dùng khăn giấy thấm khô dịch gà (nếu có). Vứt khăn giấy ngay vào thùng rác.</li>
        <li>Chế biến ngay (luộc, kho, nướng). Nhiệt độ trên 75°C sẽ diệt sạch vi khuẩn.</li>
        <li>Rửa tay sạch bằng xà phòng sau khi chạm vào gà sống.</li>
      </ol>
    `
  },
  {
    id: '5',
    title: 'Phân biệt thịt bò già và thịt bò tơ',
    excerpt: 'Làm sao để chọn được miếng thịt bò mềm tan trong miệng cho món Steak?',
    category: 'Mẹo vặt',
    date: '22/10/2024',
    author: 'Chef Long',
    authorRole: 'Đầu bếp',
    authorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=200',
    // Nice raw steak image
    image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&q=80&w=800',
    content: `
      <p>Thịt bò tơ thường có thớ thịt mịn, màu đỏ tươi, mỡ trắng và thơm mùi sữa. Khi ấn vào cảm giác mềm mại. Thích hợp cho các món xào, nhúng lẩu, tái.</p>
      <img src="https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800" alt="Thịt bò Steak" />
      <p>Thịt bò già thớ thịt to, màu đỏ sậm, mỡ có màu vàng đậm hơn. Khi ăn sẽ dai hơn nhưng hương vị lại đậm đà hơn. Thích hợp cho các món hầm, sốt vang, kho.</p>
    `
  }
];