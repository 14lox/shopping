require_relative 'spec_helper'

describe WwScraper do
  let(:scraper) {WwScraper.new}
  let(:doc) {Nokogiri::XML::Document.parse( File.open(File.join File.dirname(__FILE__),'ww.xml').read)}

  it 'should get content node' do
    node = doc.root.xpath('.//div[@id="content-panel"]')
    newnode = Nokogiri::XML::Document.parse("<div> #{node.inner_text} </div>").root
    scraper.get_data_from_content_node newnode
    
  end

end